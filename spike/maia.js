// Maia-3 encoding, ported from github.com/CSSLab/maia3 (maia3/dataset.py, utils.py).
// tokens[64][12]: square a1=0..h8=63, channels P N B R Q K (mover) then p n b r q k.
// Black to move: board is mirrored (ranks flipped, colors swapped), so the mover is always "white".
// Policy: index from*64+to for 4096 moves, then 256 promotions (a7..h7 -> a8..h8, q r b n).
// Elo is passed raw; the model clamps to 0..5000 and interpolates.

const PIECES = 'pnbrqk';
const PROMOS = 'qrbn';
const sq = (name) => (name.charCodeAt(0) - 97) + 8 * (name.charCodeAt(1) - 49);
const flip = (name) => name[0] + (9 - Number(name[1]));

export function encode(chess) {
  const tokens = new Float32Array(64 * 12);
  const black = chess.turn() === 'b';
  chess.board().forEach((row, r) => row.forEach((p, f) => {
    if (!p) return;
    const rank = 7 - r; // board()[0] is rank 8
    const s = f + 8 * (black ? 7 - rank : rank);
    const mine = (p.color === 'w') !== black;
    tokens[s * 12 + PIECES.indexOf(p.type) + (mine ? 0 : 6)] = 1;
  }));
  return tokens;
}

export function moveIndex(uci, black) {
  let from = uci.slice(0, 2), to = uci.slice(2, 4);
  if (black) { from = flip(from); to = flip(to); }
  if (uci.length > 4) {
    return 4096 + ((from.charCodeAt(0) - 97) * 8 + (to.charCodeAt(0) - 97)) * 4 + PROMOS.indexOf(uci[4]);
  }
  return sq(from) * 64 + sq(to);
}

// Returns legal moves with probabilities for the side to move, sorted high to low.
export async function maiaMoves(ort, session, chess, eloSelf, eloOppo) {
  const feeds = {
    tokens: new ort.Tensor('float32', encode(chess), [1, 64, 12]),
    elo_self: new ort.Tensor('float32', Float32Array.of(eloSelf), [1]),
    elo_oppo: new ort.Tensor('float32', Float32Array.of(eloOppo), [1]),
  };
  const logits = (await session.run(feeds)).logits_move.data;
  const black = chess.turn() === 'b';
  const moves = chess.moves({ verbose: true }).map((m) => {
    const uci = m.from + m.to + (m.promotion ?? '');
    return { uci, san: m.san, logit: logits[moveIndex(uci, black)] };
  });
  const max = Math.max(...moves.map((m) => m.logit));
  let sum = 0;
  for (const m of moves) sum += (m.p = Math.exp(m.logit - max));
  for (const m of moves) m.p /= sum;
  return moves.sort((a, b) => b.p - a.p);
}

export function sample(moves, rand = Math.random) {
  let r = rand();
  for (const m of moves) if ((r -= m.p) <= 0) return m;
  return moves[0];
}
