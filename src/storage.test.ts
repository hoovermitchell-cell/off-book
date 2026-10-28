import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { posKey } from './data/prep';
import { BACKUP_APP, BACKUP_VERSION, exportBackup, loadOpening, loadSaved, OPENING_KEY, parseBackup, save, saveOpening, STORAGE_KEY, updateSaved } from './storage';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe('storage', () => {
  const lad = { a: { level: 2, due: 100 } };

  it('round-trips the ladder and proven lines', () => {
    const store = memory();
    save({ ladder: lad, proven: ['textbook'] }, store);
    expect(loadSaved(store)).toEqual({ ladder: lad, proven: ['textbook'] });
  });

  it('carries the first format over: learned moves start the ladder, due now', () => {
    const store = memory();
    store.setItem(STORAGE_KEY, JSON.stringify({ correct: 5, learned: ['a', 'b'] }));
    expect(loadSaved(store)).toEqual({ ladder: { a: { level: 0, due: 0 }, b: { level: 0, due: 0 } }, proven: [] });
  });

  it('survives junk', () => {
    const store = memory();
    store.setItem(STORAGE_KEY, '{not json');
    expect(loadSaved(store)).toEqual({ ladder: {}, proven: [] });
    store.setItem(STORAGE_KEY, JSON.stringify({ ladder: { a: { level: -1, due: 0 }, b: { level: 1, due: 'x' }, c: { level: 1, due: 5 } }, proven: ['x', 3] }));
    expect(loadSaved(store)).toEqual({ ladder: { c: { level: 1, due: 5 } }, proven: ['x'] });
  });

  it("updates apply to the latest save, so another tab's progress survives", () => {
    const store = memory();
    save({ ladder: lad, proven: [] }, store); // another tab wrote this after we loaded
    const { saved, ok } = updateSaved((s) => ({ ...s, proven: [...s.proven, 'textbook'] }), store);
    expect(ok).toBe(true);
    expect(saved).toEqual({ ladder: lad, proven: ['textbook'] });
  });

  it('reports when the browser refuses to store progress', () => {
    const store = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } };
    expect(updateSaved((s) => s, store).ok).toBe(false);
  });

  describe('backup file', () => {
    const data = { ladder: lad, proven: ['textbook'] };
    const file = (over: object = {}, d: unknown = data) =>
      JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: 'x', data: d, ...over });
    const reason = (text: string) => {
      const r = parseBackup(text);
      return r.ok ? null : r.reason;
    };

    it('round-trips through export and parse', () => {
      const b = exportBackup(data, new Date('2026-10-23T12:00:00Z'));
      expect(b).toMatchObject({ app: 'off-book', version: 3, exportedAt: '2026-10-23T12:00:00.000Z' });
      expect(parseBackup(JSON.stringify(b))).toEqual({ ok: true, saved: data });
    });

    it('restores through updateSaved over what was there', () => {
      const store = memory();
      save({ ladder: { old: { level: 4, due: 0 } }, proven: [] }, store);
      const r = parseBackup(file());
      if (!r.ok) throw new Error(r.reason);
      updateSaved(() => r.saved, store);
      expect(loadSaved(store)).toEqual(data);
    });

    it('still restores a version 1 file', () => {
      expect(parseBackup(file({ version: 1 }, { correct: 12, learned: ['a'] }))).toEqual({ ok: true, saved: { ladder: { a: { level: 0, due: 0 } }, proven: [] } });
    });

    it('rejects malformed JSON', () => {
      expect(reason('{nope')).toMatch(/readable/);
      expect(reason('')).toMatch(/readable/);
    });

    it('rejects another app, or no object at all', () => {
      expect(reason(file({ app: 'other' }))).toMatch(/isn't an Off Book backup/);
      expect(reason('null')).toMatch(/isn't an Off Book backup/);
      expect(reason('[1]')).toMatch(/isn't an Off Book backup/);
    });

    it('rejects an unknown version', () => {
      expect(reason(file({ version: 4 }))).toMatch(/different version/);
      expect(reason(file({ version: undefined }))).toMatch(/different version/);
    });

    it('rejects missing or badly typed fields', () => {
      expect(reason(file({}, null))).toMatch(/no progress/);
      expect(reason(file({}, { proven: [] }))).toMatch(/learned moves/);
      expect(reason(file({ version: 1 }, { correct: 1, learned: 'a' }))).toMatch(/learned moves/);
      expect(reason(file({ version: 1 }, { correct: 1, learned: ['a', 2] }))).toMatch(/learned moves/);
    });
  });
});

// Ladder keys gained the prescribed move (backup version 3). Older saves and backups key by position only.
describe('legacy ladder keys', () => {
  const at = (...sans: string[]) => {
    const c = new Chess();
    for (const san of sans) c.move(san);
    return posKey(c.fen());
  };
  // Positions in the London tree (White: 1.d4, 2.Bf4) and the Caro-Kann tree (Black: 1...c6), and one in neither.
  const legacy = { [at()]: { level: 3, due: 10 }, [at('d4', 'd5')]: { level: 1, due: 20 }, [at('e4')]: { level: 2, due: 30 }, [at('h4')]: { level: 4, due: 40 } };
  const migrated = { [`${at()} d2d4`]: { level: 3, due: 10 }, [`${at('d4', 'd5')} c1f4`]: { level: 1, due: 20 }, [`${at('e4')} c7c6`]: { level: 2, due: 30 } };
  const v2 = JSON.stringify({ app: BACKUP_APP, version: 2, exportedAt: 'x', data: { ladder: legacy, proven: ['textbook'] } });

  it('a version 2 backup restores with exactly its earned rungs under the new keys', () => {
    // 1.h4 is in neither tree, so that rung is dropped rather than guessed at.
    expect(parseBackup(v2)).toEqual({ ok: true, saved: { ladder: migrated, proven: ['textbook'] } });
  });

  it('the first format (learned list) migrates too', () => {
    const v1 = JSON.stringify({ app: BACKUP_APP, version: 1, exportedAt: 'x', data: { correct: 3, learned: [at(), at('h4')] } });
    expect(parseBackup(v1)).toEqual({ ok: true, saved: { ladder: { [`${at()} d2d4`]: { level: 0, due: 0 } }, proven: [] } });
  });

  it('a saved ladder with old keys migrates on load, and migrating twice changes nothing', () => {
    const store = memory();
    store.setItem(STORAGE_KEY, JSON.stringify({ ladder: legacy, proven: [] }));
    const once = loadSaved(store);
    expect(once.ladder).toEqual(migrated);
    save(once, store);
    expect(loadSaved(store)).toEqual(once);
  });

  it('keys already in the new shape pass through, and a legacy key meeting one keeps the higher level', () => {
    const store = memory();
    const k = `${at()} d2d4`;
    store.setItem(STORAGE_KEY, JSON.stringify({ ladder: { [k]: { level: 1, due: 5 }, [at()]: { level: 3, due: 10 }, [`${at('c4')} e7e5`]: { level: 2, due: 7 } }, proven: [] }));
    expect(loadSaved(store).ladder).toEqual({ [k]: { level: 3, due: 10 }, [`${at('c4')} e7e5`]: { level: 2, due: 7 } });
  });
});

describe('last-picked opening', () => {
  it('round-trips under its own key, apart from progress', () => {
    const store = memory();
    expect(loadOpening(store)).toBeNull();
    expect(saveOpening('caro-kann', store)).toBe(true);
    expect(loadOpening(store)).toBe('caro-kann');
    expect(store.getItem(OPENING_KEY)).toBe('caro-kann');
    expect(store.getItem(STORAGE_KEY)).toBeNull();
  });

  it('survives storage that throws', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
    expect(loadOpening(broken)).toBeNull();
    expect(saveOpening('london', broken)).toBe(false);
  });
});
