// London System prep for White. DRAFT by Claude, pending Mitch's review (decision 4b).
// Each line is a move list; the tree maps every position where White is to move to White's prep move.
// Lines may transpose into each other; the position key makes that work for free.
export const LINES = [
  // Main line vs ...d5 / ...Nf6 / ...e6
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3',
  'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O Bd3',
  'd4 d5 Bf4 Nf6 e3 Bf5 c4 e6 Nc3 c6 Qb3 Qb6 c5',
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Bd3 c5 c3 Nc6 Nbd2',
  'd4 d5 Bf4 e6 e3 Nf6 Nf3',
  'd4 d5 Bf4 Bf5 e3 e6 c4 Bb4+ Nc3',
  'd4 d5 Bf4 c5 e3 Nc6 Nc3',
  // ...Nc6 setups, the most common reply at 900
  'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 Bf5 Bb5',
  'd4 d5 Bf4 Nc6 e3 Bf5 c4 e6 Nc3',
  'd4 d5 Bf4 Nc6 e3 e6 Nf3 Nf6 Bd3',
  'd4 Nc6 Bf4 d5 e3',
  // Beginner tries
  'd4 d5 Bf4 f6 e3 e5 dxe5 fxe5 Qh5+',
  'd4 d5 Bf4 e5 Bxe5',
  // King's Indian / Queen's Indian setups
  'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 h3',
  'd4 Nf6 Bf4 d5 e3',
  'd4 Nf6 Bf4 e6 e3 c5 c3 d5 Nd2',
  'd4 Nf6 Bf4 c5 e3 Qb6 Nc3',
  'd4 e6 Bf4 d5 e3',
  'd4 e6 Bf4 Nf6 e3',
  'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4',
  // Other first replies Maia plays at 1000 (each 2 to 5%)
  'd4 d6 Bf4 Nf6 e3 g6 Nf3 Bg7 Be2',
  'd4 g6 Bf4 Bg7 e3 d6 Nf3',
  'd4 f5 Bf4 Nf6 e3 e6 Nf3',
  'd4 c5 d5 e5 e4 d6 Nc3',
];

export const posKey = (fen) => fen.split(' ').slice(0, 4).join(' ');

export function buildTree(Chess) {
  const tree = new Map();
  for (const line of LINES) {
    const chess = new Chess();
    for (const san of line.split(' ')) {
      const key = posKey(chess.fen());
      const m = chess.move(san); // throws on an illegal move
      if (m.color !== 'w') continue;
      const prev = tree.get(key);
      if (prev && prev.san !== m.san) throw new Error(`conflict at ${key}: ${prev.san} vs ${m.san}`);
      tree.set(key, { san: m.san, uci: m.from + m.to + (m.promotion ?? '') });
    }
  }
  return tree;
}
