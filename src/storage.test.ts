import { describe, expect, it } from 'vitest';
import { loadSaved, save, STORAGE_KEY } from './storage';

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
});
