import { describe, expect, it } from 'vitest';
import { BACKUP_APP, BACKUP_VERSION, exportBackup, loadSaved, parseBackup, save, STORAGE_KEY, updateSaved } from './storage';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe('storage', () => {
  it('round-trips progress and learned positions', () => {
    const store = memory();
    save({ correct: 7, learned: ['a', 'b'] }, store);
    expect(loadSaved(store)).toEqual({ correct: 7, learned: ['a', 'b'] });
  });

  it('reads saves from before learning existed, and survives junk', () => {
    const store = memory();
    store.setItem(STORAGE_KEY, JSON.stringify({ correct: 5 }));
    expect(loadSaved(store)).toEqual({ correct: 5, learned: [] });
    store.setItem(STORAGE_KEY, '{not json');
    expect(loadSaved(store)).toEqual({ correct: 0, learned: [] });
  });

  it("updates apply to the latest save, so another tab's progress survives", () => {
    const store = memory();
    save({ correct: 3, learned: ['a'] }, store); // another tab wrote this after we loaded
    const { saved, ok } = updateSaved((s) => ({ ...s, correct: s.correct + 1, learned: [...new Set([...s.learned, 'b'])] }), store);
    expect(ok).toBe(true);
    expect(saved).toEqual({ correct: 4, learned: ['a', 'b'] });
  });

  it('reports when the browser refuses to store progress', () => {
    const store = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } };
    expect(updateSaved((s) => s, store).ok).toBe(false);
  });

  describe('backup file', () => {
    const file = (over: object = {}, data: unknown = { correct: 12, learned: ['a', 'b'] }) =>
      JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: 'x', data, ...over });
    const reason = (text: string) => {
      const r = parseBackup(text);
      return r.ok ? null : r.reason;
    };

    it('round-trips through export and parse', () => {
      const data = { correct: 12, learned: ['a', 'b'] };
      const b = exportBackup(data, new Date('2026-10-23T12:00:00Z'));
      expect(b).toMatchObject({ app: 'off-book', version: 1, exportedAt: '2026-10-23T12:00:00.000Z' });
      expect(parseBackup(JSON.stringify(b))).toEqual({ ok: true, saved: data });
    });

    it('restores through updateSaved over what was there', () => {
      const store = memory();
      save({ correct: 99, learned: ['old'] }, store);
      const r = parseBackup(file());
      if (!r.ok) throw new Error(r.reason);
      updateSaved(() => r.saved, store);
      expect(loadSaved(store)).toEqual({ correct: 12, learned: ['a', 'b'] });
    });

    it('sanitises like loadSaved: floors the count', () => {
      expect(parseBackup(file({}, { correct: 4.9, learned: [] }))).toEqual({ ok: true, saved: { correct: 4, learned: [] } });
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
      expect(reason(file({ version: 2 }))).toMatch(/different version/);
      expect(reason(file({ version: undefined }))).toMatch(/different version/);
    });

    it('rejects missing or badly typed fields', () => {
      expect(reason(file({}, null))).toMatch(/no progress/);
      expect(reason(file({}, { correct: '12', learned: [] }))).toMatch(/move count/);
      expect(reason(file({}, { correct: -1, learned: [] }))).toMatch(/move count/);
      expect(reason(file({}, { learned: [] }))).toMatch(/move count/);
      expect(reason(file({}, { correct: 1, learned: 'a' }))).toMatch(/learned moves/);
      expect(reason(file({}, { correct: 1, learned: ['a', 2] }))).toMatch(/learned moves/);
    });
  });
});
