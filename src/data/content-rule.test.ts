import { describe, expect, it } from 'vitest';
import { buildTree as caroKannTree } from './caro-kann';
import { AUTO as caroKannAuto } from './caro-kann-auto';
import { buildTree as frenchTree } from './french';
import { AUTO as frenchAuto } from './french-auto';
import { buildTree as italianTree } from './italian';
import { AUTO as italianAuto } from './italian-auto';
import { buildTree as londonTree } from './london';
import { AUTO as londonAuto } from './london-auto';
import { OPENINGS } from './openings';
import type { PrepMove, PrepTree } from './prep';
import { buildTree as qgdTree } from './qgd';
import { AUTO as qgdAuto } from './qgd-auto';
import { buildTree as queensGambitTree } from './queens-gambit';
import { AUTO as queensGambitAuto } from './queens-gambit-auto';
import { buildTree as scotchTree } from './scotch';
import { AUTO as scotchAuto } from './scotch-auto';
import { buildTree as slavTree } from './slav';
import { AUTO as slavAuto } from './slav-auto';

// The content rule (decision 16): going deeper never changes a prep move already learned. Pinned lines
// win over AUTO in the tree, so a pin that disagrees with an AUTO entry would silently move a learned key.
// Each stage agreeing with the tree is checked in levels.test.ts.
const SOURCES: Record<string, { pinned: PrepTree; auto: Record<string, PrepMove> }> = {
  london: { pinned: londonTree({ auto: false }), auto: londonAuto },
  'caro-kann': { pinned: caroKannTree({ auto: false }), auto: caroKannAuto },
  'queens-gambit': { pinned: queensGambitTree({ auto: false }), auto: queensGambitAuto },
  slav: { pinned: slavTree({ auto: false }), auto: slavAuto },
  italian: { pinned: italianTree({ auto: false }), auto: italianAuto },
  french: { pinned: frenchTree({ auto: false }), auto: frenchAuto },
  scotch: { pinned: scotchTree({ auto: false }), auto: scotchAuto },
  qgd: { pinned: qgdTree({ auto: false }), auto: qgdAuto },
};

describe('content rule', () => {
  it('covers every opening', () => {
    expect(Object.keys(SOURCES).sort()).toEqual(OPENINGS.map((o) => o.id).sort());
  });

  it.each(OPENINGS)('$id: no pinned line overrides an AUTO entry with a different move', (o) => {
    const { pinned, auto } = SOURCES[o.id];
    for (const [key, p] of pinned) if (auto[key]) expect(p.san, key).toBe(auto[key].san);
  });
});
