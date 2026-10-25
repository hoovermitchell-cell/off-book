// Tiny made-up openings for the collision fixtures (decision 16, step 0). Each pair shares a position
// and parts ways at it: London / QG (2.Bf4 vs 2.c4), Italian / Scotch (3.Bc4 vs 3.d4), Slav / QGD
// (2...c6 vs 2...e6). No real opening data lives here.
import { buildPrepTree } from './data/prep';
import type { Opening, Stage } from './data/openings';

const stage = (id: string, moves: string): Stage => ({ id, name: id, tier: 'intro', moves: moves.split(' ') });

function open(id: string, side: 'w' | 'b', lines: string[], stages: Stage[], forcedReplies: string[] = []): Opening {
  return { id, name: id, side, tree: buildPrepTree(lines, {}, side), ideaFor: () => null, forcedReplies, heading: id, opponentLine: () => '', example: ['e4', 'e2e4'], stages };
}

export const LONDON = open('london', 'w', ['d4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3', 'd4 d5 Bf4 Nf6 e3 c5 c3'], [
  stage('london-main', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3'),
  stage('london-c5', 'd4 d5 Bf4 Nf6 e3 c5 c3'), // shares its first three moves with london-main
]);
export const QG = open('qg', 'w', ['d4 d5 c4 e6 Nc3 Nf6 Bg5'], [stage('qg-main', 'd4 d5 c4 e6 Nc3 Nf6 Bg5')]);
export const ITALIAN = open('italian', 'w', ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3'], [stage('italian-main', 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3')], ['e5']);
export const SCOTCH = open('scotch', 'w', ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nc3'], [stage('scotch-main', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nc3')], ['e5']);
export const SLAV = open('slav', 'b', ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4'], [stage('slav-main', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4')], ['d4']);
export const QGD = open('qgd', 'b', ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7'], [stage('qgd-main', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7')], ['d4']);

/** In the order the drill would list them: a side's first opening wins a tie. */
export const SYNTHETIC: Opening[] = [LONDON, QG, ITALIAN, SCOTCH, SLAV, QGD];
