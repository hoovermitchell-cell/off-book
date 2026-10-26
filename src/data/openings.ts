// The openings the drill offers. A small array, not a plugin system: add an entry to add an opening.
import { buildTree as londonTree } from './london';
import { ideaFor as londonIdea } from './london-ideas';
import { buildTree as caroKannTree } from './caro-kann';
import { ideaFor as caroKannIdea } from './caro-kann-ideas';
import { buildTree as queensGambitTree } from './queens-gambit';
import { ideaFor as queensGambitIdea } from './queens-gambit-ideas';
import { buildTree as slavTree } from './slav';
import { ideaFor as slavIdea } from './slav-ideas';
import { buildTree as italianTree } from './italian';
import { ideaFor as italianIdea } from './italian-ideas';
import { buildTree as frenchTree } from './french';
import { ideaFor as frenchIdea } from './french-ideas';
import { buildTree as scotchTree } from './scotch';
import { ideaFor as scotchIdea } from './scotch-ideas';
import { buildTree as qgdTree } from './qgd';
import { ideaFor as qgdIdea } from './qgd-ideas';
import type { PrepMove, PrepTree } from './prep';

/** How deep a staged line goes (decision 16): Intro, then Intermediate, then Advanced, in unlock order. */
export type Tier = 'intro' | 'intermediate' | 'advanced';

/** A staged line (decision 14b): the opponent plays these fixed moves, then Maia takes over. */
export interface Stage {
  id: string;
  name: string;
  tier: Tier;
  /** SAN, both sides, from the start position. */
  moves: string[];
  /** A theory note for the line (decision 16): the plan, the pawn structure, the usual mistake. */
  note?: string;
}

const stage = (id: string, name: string, moves: string): Stage => ({ id, name, tier: 'intro', moves: moves.split(' ') });
/** An Intermediate line (decision 16 pilot, docs/plans/2026-10-25-tier-pilot.md). DRAFT notes, pending Mitch's review. */
const deeper = (id: string, name: string, moves: string, note: string): Stage => ({ ...stage(id, name, moves), tier: 'intermediate', note });
/** An Advanced line (decision 16): a critical continuation or tactical exception, with why the tempting alternative fails.
 *  docs/plans/2026-10-26-advanced-tier.md. DRAFT notes, pending Mitch's review. */
const critical = (id: string, name: string, moves: string, note: string): Stage => ({ ...stage(id, name, moves), tier: 'advanced', note });

export interface Opening {
  id: string;
  /** Shown in the picker, with the side. */
  name: string;
  /** The student's colour. */
  side: 'w' | 'b';
  /** Prep: position key to the student's move. */
  tree: PrepTree;
  /** The one-line idea shown with a new prep move. */
  ideaFor(fen: string, prep: PrepMove): string | null;
  /** The opponent's first moves in SAN, played by rule at its turns while the student is in book;
   *  Maia takes over after them, and a staged line wins over them. [] for an opening with no forced reply. */
  forcedReplies: string[];
  /** The first line of the drill panel. */
  heading: string;
  /** The opponent line under it. */
  opponentLine(rating: number): string;
  /** A move in SAN and in from-to form, for the typed-move hints. */
  example: [string, string];
  /** Staged lines in the order they unlock (decisions 14b, 14d, 15). */
  stages: Stage[];
}

export const OPENINGS: Opening[] = [
  {
    id: 'london',
    name: 'London',
    side: 'w',
    tree: londonTree(),
    ideaFor: londonIdea,
    forcedReplies: [],
    heading: 'Play your London as White.',
    opponentLine: (rating) => `Black answers like a ${rating}-rated player.`,
    example: ['Nf3', 'e2e4'],
    // docs/review/staged-lines.md, one line per setup (decision 14d).
    stages: [
      stage('textbook', 'Textbook', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3'),
      stage('nc6-bf5', '...Nc6 and ...Bf5', 'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 Bf5 Nbd2 e6 c3 Bd6 Bg3 O-O Be2 Ne4'),
      stage('e6-bd6', '...e6 and early ...Bd6', 'd4 e6 Bf4 d5 e3 Nf6 Nf3 Bd6 Bg3 O-O Bd3 Nc6 c3'),
      stage('early-bf5', 'Early ...Bf5', 'd4 d5 Bf4 Bf5 e3 e6 Bd3 Bg6 Nf3 Nf6 c3'),
      stage('nf6-bf5', '...Bf5 after ...Nf6', 'd4 d5 Bf4 Nf6 e3 Bf5 Bd3 Bxd3 Qxd3 e6 Nf3 Bd6 Bg3'),
      // Intermediate: the textbook continued, then setups by Maia frequency (King's Indian, 2.0%).
      deeper('textbook-12', 'Textbook, to move 12', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3 Re8 Ne5 cxd4 exd4 Nxe5 dxe5 Bxe5 Bxe5',
        "With your pieces out, the knight jumps to e5 and eyes Black's kingside. If Black swaps on d4, take back with the e-pawn: it keeps the e-file and e5 for you. Then if ...Nxe5, dxe5 attacks the bishop on d6 and the knight on f6 at once, and the pawn fork wins a piece for a pawn."),
      deeper('kid', "King's Indian setup", 'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 h3 Nbd7 c3 Re8 Nbd2 e5 Bg5',
        "Against ...g6, ...Bg7 and ...d6, keep the London shape but put the bishop on e2. h3 gives the f4 bishop a retreat on h2, so ...Nh5 can't trade it off. Black's plan is ...e5; when it comes, Bg5 pins the f6 knight to the queen, since ...e5 has emptied e7."),
      // Advanced, ranked by Maia's chance of reaching the opponent's critical move (docs/plans/2026-10-26-advanced-tier.md).
      critical('bb4-ba5', '...Bb4+ and ...Ba5', 'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 e6 Bd3 Bb4+ c3 Ba5 Nbd2 O-O Qc2 Re8 Ne5 Nxe5 dxe5',
        "Black's ...Bb4+ looks active, but c3 is a move you wanted anyway, and after ...Ba5 the bishop sits at the edge of the board, far from its king. Stockfish rates the check about half a pawn worse for Black than ...Bd6. Keep developing: Nbd2, then Qc2, so your queen backs up the bishop on d3 and both aim at h7. Then play Ne5. If Black takes it, dxe5 attacks the knight on f6, and with the bishop and queen pointing at h7 that knight has no good square."),
      critical('bxg3', '...Bxg3 and hxg3', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 Bxg3 hxg3 O-O Nc3 Nc6 Ne5 Nxe5 dxe5 Ne4 Nxe4',
        "When Black trades bishops on g3, take back with the h-pawn. hxg3 opens the h-file for your rook, and your f2 pawn keeps guarding e3. fxg3? looks natural, but then no pawn guards e3 and Stockfish prefers Black. Develop with Nc3 and Ne5. If Black takes on e5, dxe5 attacks the knight on f6. If it jumps to e4, Nxe4 dxe4 and your rook swings to h4 to attack the weak pawn."),
      critical('f6-g5', '...f6 and ...g5', 'd4 d5 Bf4 f6 e3 g5 Qh5+ Kd7 Bg3 Qe8 Qf3 c6 h4 gxh4 Rxh4',
        "After ...f6, Black's ...g5 tries to win your bishop. Don't take on g5: Bxg5? fxg5 costs you a bishop for a pawn, and Stockfish prefers Black. Check first. Black's f- and g-pawns have both moved, so Qh5+ is check, and the king has one square, d7. Then the bishop drops back to g3, safe, and Black can never castle. Open the h-file with h4 and go after a king stuck in the middle."),
      critical('ne4-f3', '...Ne4 and f3', 'd4 d5 Bf4 Nf6 e3 Ne4 Bd3 Bf5 f3 Nd6 Bxd6 Bxd3 Bxe7 Qxe7 Qxd3',
        "If Black jumps ...Ne4 on move 3, hit it with Bd3. When Black guards it with ...Bf5, play f3! The knight is attacked twice, by the pawn and the bishop, and Stockfish says White is winning against every move except ...Nd6. Then Bxd6, and if Black takes on d3 first, Bxe7 wins a pawn: ...Qxe7 Qxd3. Don't play Bxe4 instead. It just trades, and the position is equal."),
    ],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann',
    side: 'b',
    tree: caroKannTree(),
    ideaFor: caroKannIdea,
    // The tree covers only 1.e4 (decision 14b stages Black's replies; Maia takes over after move 1).
    forcedReplies: ['e4'],
    heading: 'Play your Caro-Kann as Black.',
    opponentLine: (rating) => `White opens 1.e4, then answers like a ${rating}-rated player.`,
    example: ['Nf6', 'e7e5'],
    // docs/review/caro-kann-lines.md, in its order (decision 15).
    stages: [
      stage('classical', 'Classical', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bf4 Ngf6 O-O-O Be7 Kb1 O-O'),
      stage('exchange-nf3', 'Exchange with Nf3', 'e4 c6 Nf3 d5 exd5 cxd5 d4 Nc6 Bb5 Bf5 Ne5 Rc8 Qf3 e6 g4 Bg6'),
      stage('bc4', '2.Bc4', 'e4 c6 Bc4 d5 exd5 cxd5 Bb3 Bf5 Nf3 e6 O-O Nd7 d4 Ngf6 Bg5'),
      stage('nc3-exd5', '2.Nc3 and exd5', 'e4 c6 Nc3 d5 exd5 cxd5 d4 Bf5 Nf3 e6 Bb5+ Nc6 Ne5'), // ends before 7...Ne7: the tree's prep there is now 7...Qb6
      stage('advance', 'Advance', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Bd3 Bxd3 Qxd3 c5'),
      stage('classical-bd3', 'Classical with 5.Bd3', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3 Qxd4 Nf3 Qd8 O-O'), // ends before 7...Bxe4: the tree's prep there is 7...e6
      stage('d3', '2.d3', 'e4 c6 d3 d5 Nd2 e5 Ngf3 Bd6 g3 Nf6 Bg2 O-O'),
      // Intermediate: the Classical continued, then setups by Maia frequency (Two Knights 1.6%, Fantasy 1.0%, Panov 0.7%).
      deeper('classical-17', 'Classical, into the endgame', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bf4 Ngf6 O-O-O Be7 Kb1 O-O Ne4 c5 dxc5 Nxc5 Nxc5 Bxc5 Qxd8 Raxd8',
        "Once your king is castled, ...c5 is the Classical's break: it hits d4 and frees your pieces. When White takes on c5 and offers the queens, trade: the endgame is level and your pawns have no weak points. White's pawn on h5 is the one that can become weak there."),
      deeper('two-knights', 'Two Knights', 'e4 c6 Nc3 d5 Nf3 Bg4 h3 Bxf3 Qxf3 e6 d3 Nf6 Bg5 Nbd7 exd5 cxd5',
        "Against 2.Nc3 and 3.Nf3, ...Bg4 pins the knight and then trades it, so White gets the bishop pair but less control of d4 and e5. Build with ...e6, ...Nf6 and ...Nbd7. When White takes on d5, take back with the c-pawn so you keep a pawn in the center."),
      deeper('fantasy', 'Fantasy', 'e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 Bg4 Bc4 Nd7 O-O Ngf6 dxe5 Qb6+',
        "3.f3 props up e4 for a big center. Take on e4 and hit back with ...e5 before White is developed. With the f-pawn gone, the diagonals to White's king are open: dxe5 too early allows ...Qh4+, and after castling ...Qb6+ checks and hits b2. Don't take on f3 before ...Nd7: after Qxf3, the queen and the c4 bishop both hit f7."),
      deeper('panov', 'Panov', 'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1 Nf6 Be3 b6 Qc2 Nb4',
        "After the trades White has an isolated pawn on d4, with no pawn beside it to guard it. Aim your pieces at it, keep it blockaded, and welcome trades: every trade makes the lone pawn weaker. ...b6 makes room for your last bishop, and ...Nb4 hits the queen and the d3 bishop."),
      // Advanced, ranked by Maia's chance of reaching the opponent's critical move (docs/plans/2026-10-26-advanced-tier.md).
      critical('nf3-dxe4', '3.Nf3 and 4.Ne5', 'e4 c6 d4 d5 Nf3 dxe4 Ne5 Nd7 Bc4 Nxe5 dxe5 Qa5+ Bd2 Qxe5',
        "After 3.Nf3 you can simply take the pawn: the knight doesn't guard e4. If White jumps to e5, which eyes f7, hit the knight with ...Nd7. When Bc4 puts a second attacker on f7, take the knight with ...Nxe5. After dxe5, ...Qa5+ checks the king and attacks e5 at the same time, and the pawn falls. Stockfish thinks ...Nxe5 is clearly the best fifth move."),
      critical('qh5', '2.Qh5', 'e4 c6 Qh5 Nf6 Qf3 e5 Bc4 d5 exd5 cxd5 Bb5+ Nc6 Bxc6+ bxc6 d3 Bd6',
        "2.Qh5 brings the queen out early, so make White pay for the lost time. ...Nf6 develops a piece and attacks the queen. After Qf3, grab the center with ...e5. When the bishop comes to c4, ...d5! hits it, and after exd5 ...cxd5 hits it again. The trap to know comes at the end: after Bb5+ Nc6 Bxc6+, take back with the b-pawn. ...Bd7?? and ...Ke7?? both lose."),
      critical('f3-d4', '2.Nc3 and 3.f3', 'e4 c6 Nc3 d5 f3 d4 Nce2 e5 c3 d3 Ng3 g6',
        "3.f3 tries to protect e4, but the knight on c3 has no good square after ...d4!. The best retreat, Nce2, shuts in White's own bishop on f1. Take space with ...e5. If White then plays the natural 5.c3?, ...d3! The pawn attacks the knight on e2, and White has nothing that attacks it: the queen is blocked by the pawn on d2 and the bishop by the knight. Stockfish thinks Black is winning. After Ng3, ...g6 takes f5 from the knight, and ...h5 comes next."),
      critical('ne5-qd4', '2.Nf3 and 3.Ne5', 'e4 c6 Nf3 d5 Ne5 dxe4 Bc4 e6 O-O Qd4 Qh5 g6',
        "3.Ne5 hopes for a quick attack on f7. Take the pawn: the knight on e5 doesn't attack e4. After Bc4, ...e6 blocks the bishop's diagonal to f7, so only the knight still attacks it. When White castles, ...Qd4! attacks the knight on e5, which nothing guards. If White goes for f7 with Qh5, ...g6 hits the queen and stops Qxf7+."),
    ],
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    side: 'w',
    tree: queensGambitTree(),
    ideaFor: queensGambitIdea,
    // The tree covers only 1.d4 d5 (decision 16); the drill forces 1...d5 and Maia takes over after it.
    forcedReplies: ['d5'],
    heading: "Play your Queen's Gambit as White.",
    opponentLine: (rating) => `Black answers 1.d4 with ...d5, then replies like a ${rating}-rated player.`,
    example: ['Nf3', 'e2e4'],
    // docs/review/qg-slav-lines.md: the Exchange line first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('exchange', 'Exchange', 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8 Rab1'),
      stage('qga-b5', '2...dxc4 and ...b5', 'd4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5 Qf3'),
      stage('nf6-nf3', '2...Nf6', 'd4 d5 c4 Nf6 Nf3 dxc4 Nc3 Nc6 e3 Bg4 Bxc4 e6 Qc2 Bxf3 gxf3'),
      stage('semi-slav', '2...c6 and ...e6', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Bb4 Bd3'),
      stage('qgd-dxc4', '3...dxc4', 'd4 d5 c4 e6 Nc3 dxc4 e4 Bb4 Bxc4 Bxc3+ bxc3 Nf6 e5 Ne4 Qg4'),
    ],
  },
  {
    id: 'slav',
    name: 'Slav',
    side: 'b',
    tree: slavTree(),
    ideaFor: slavIdea,
    // The tree covers only 1.d4 (decision 16); Maia takes over after move 1, as in the Caro-Kann.
    forcedReplies: ['d4'],
    heading: 'Play your Slav as Black.',
    opponentLine: (rating) => `White opens 1.d4, then answers like a ${rating}-rated player.`,
    example: ['Nf6', 'e7e5'],
    // docs/review/qg-slav-lines.md: the main line first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('main-line', 'Main line', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O O-O Qe2 Nbd7'),
      stage('nf3-bg5', '2.Nf3 and Bg5', 'd4 d5 Nf3 c6 Nc3 Nf6 Bg5 Bf5 e3 e6 Bd3 Nbd7 Bxf5 exf5 O-O Bd6'),
      stage('nc3-e4', '2.Nc3 and e4', 'd4 d5 Nc3 c6 e4 dxe4 Nxe4 Nf6 Nxf6+ exf6 Nf3 Bf5 Bd3 Bd6 Bxf5 Qa5+'),
      stage('e3-bd3', '2.e3 and Bd3', 'd4 d5 e3 Nf6 Nf3 c6 Bd3 Bg4 Nbd2 e6 O-O Nbd7'),
      stage('london-bf4', '2.Bf4, the London', 'd4 d5 Bf4 Nf6 e3 c6 Nf3 Bf5 Bd3 Bxd3 Qxd3 e6 Nbd2 Nbd7'),
    ],
  },
  {
    id: 'italian',
    name: 'Italian',
    side: 'w',
    tree: italianTree(),
    ideaFor: italianIdea,
    // The tree covers 1.e4 e5 (decision 16); the drill forces 1...e5 and Maia takes over after it.
    // The two starter-route stages open differently, and a staged line wins over the forced reply.
    forcedReplies: ['e5'],
    heading: 'Play your Italian as White.',
    opponentLine: (rating) => `Black answers 1.e4 with ...e5, then replies like a ${rating}-rated player.`,
    example: ['Nf3', 'e2e4'],
    // docs/review/italian-french-lines.md: the slow Giuoco Piano first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('giuoco-piano', 'Giuoco Piano', 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3'),
      stage('philidor', '2...d6, the Philidor', 'e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6 Nc3 Be7 Bc4 O-O O-O'), // ends before 7...c5: the tree's prep there is 8.Nf5, a Stockfish pick
      stage('starter-scandinavian', '1...d5, the Scandinavian', 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4'),
      stage('starter-french', '1...e6, the French', 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3'),
      stage('two-knights-nf6', '3...Nf6, Two Knights', 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 c3 O-O O-O d6 Re1 Bg4 Bb3'),
    ],
  },
  {
    id: 'french',
    name: 'French',
    side: 'b',
    tree: frenchTree(),
    ideaFor: frenchIdea,
    // The tree covers only 1.e4 (decision 16); Maia takes over after move 1, as in the Caro-Kann.
    forcedReplies: ['e4'],
    heading: 'Play your French as Black.',
    opponentLine: (rating) => `White opens 1.e4, then answers like a ${rating}-rated player.`,
    example: ['Nf6', 'e7e5'],
    // docs/review/italian-french-lines.md: the Rubinstein first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('rubinstein', 'Rubinstein', 'e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3 Ngf6 Nxf6+ Nxf6 Bd3 c5 dxc5 Bxc5 O-O O-O'),
      stage('french-exchange-nf3', '2.Nf3 and the Exchange', 'e4 e6 Nf3 d5 exd5 exd5 d4 Nc6 Bb5 Nf6 O-O Be7 Re1 O-O'),
      stage('french-bc4', '2.Bc4', 'e4 e6 Bc4 d5 exd5 exd5 Bb3 c5 Nf3 Nc6 O-O Nf6'),
      stage('french-advance-nf3', '3.e5, the Advance', 'e4 e6 d4 d5 e5 c5 Nf3 cxd4 Nxd4 Nc6 Nxc6 bxc6 Nc3 Bd7'),
      stage('french-kia', "2.d3, King's Indian Attack", 'e4 e6 d3 d5 Nd2 Nf6 Ngf3 c5 g3 Nc6 Bg2 Be7 O-O O-O'),
    ],
  },
  {
    id: 'scotch',
    name: 'Scotch',
    side: 'w',
    tree: scotchTree(),
    ideaFor: scotchIdea,
    // The tree covers 1.e4 e5 (decision 16); the drill forces 1...e5 and Maia takes over after it. An alternative
    // to the Italian: the two part ways at 2...Nc6 and share the Italian's support routes (docs/review/scotch-qgd-lines.md).
    // The two starter-route stages open differently, and a staged line wins over the forced reply.
    forcedReplies: ['e5'],
    heading: 'Play your Scotch as White.',
    opponentLine: (rating) => `Black answers 1.e4 with ...e5, then replies like a ${rating}-rated player.`,
    example: ['Nf3', 'e2e4'],
    // docs/review/scotch-qgd-lines.md: the Classical first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('scotch-classical', 'Classical, 4...Bc5', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4'),
      stage('scotch-philidor', '2...d6, the Philidor', 'e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6 Nc3 Be7 Bc4 O-O O-O'), // the Italian's line; ends before 7...c5, where the tree's prep is 8.Nf5, a Stockfish pick
      stage('starter-scotch-scandinavian', '1...d5, the Scandinavian', 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4'),
      stage('starter-scotch-french', '1...e6, the French', 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3'),
      stage('scotch-petroff', '2...Nf6, the Petroff', 'e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 d5 d3 Nf6 Nc6+ Qe7 Nxe7 Bxe7 c3'),
    ],
  },
  {
    id: 'qgd',
    name: "Queen's Gambit Declined",
    side: 'b',
    tree: qgdTree(),
    ideaFor: qgdIdea,
    // The tree covers only 1.d4 (decision 16); Maia takes over after move 1, as in the Slav, which this is an alternative to.
    forcedReplies: ['d4'],
    heading: "Play your Queen's Gambit Declined as Black.",
    opponentLine: (rating) => `White opens 1.d4, then answers like a ${rating}-rated player.`,
    example: ['Nf6', 'e7e5'],
    // docs/review/scotch-qgd-lines.md: the Orthodox first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('qgd-orthodox', 'Orthodox', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O Nxc3 Rxc3 e5'),
      stage('qgd-colle', '2.Nf3 or 2.e3, the Colle', 'd4 d5 Nf3 e6 e3 Nf6 Bd3 c5 c3 Nc6 Nbd2 Bd6 O-O O-O'),
      stage('qgd-nc3-bg5', '2.Nc3 and Bg5', 'd4 d5 Nc3 Nf6 Nf3 e6 Bg5 Be7 e3 O-O Bd3 Nbd7 O-O c6'),
      stage('qgd-london', '2.Bf4, the London', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Bd3 Nbd7 Nbd2 b6'),
      stage('qgd-nc3-bf4', '2.Nc3 and Bf4', 'd4 d5 Nc3 Nf6 Bf4 e6 Nb5 Bd6 Bxd6 cxd6 e3 O-O Nf3 Nc6'),
    ],
  },
];

export const DEFAULT_OPENING = OPENINGS[0];
