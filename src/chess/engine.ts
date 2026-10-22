// Minimal UCI client. `post` sends a command; feed every engine output line to `onLine`.
// Requests run one at a time. Scores come back from White's point of view.

export interface Evaluation {
  /** Centipawns from White's point of view. Mate is +/-(100000 - n). */
  cp: number;
  /** Moves to mate (signed, from the side to move), or null. */
  mate: number | null;
  /** Best move in UCI, e.g. "e2e4". */
  best: string;
  depth: number;
  nodes: number;
}

export interface Engine {
  onLine(line: string): void;
  ready(): Promise<string[]>;
  evaluate(fen: string, ms: number): Promise<Evaluation>;
  /** The engine died: rejects the pending request and every later one. */
  fail(err: Error): void;
}

interface Waiter {
  test: (line: string) => boolean;
  resolve: (lines: string[]) => void;
  reject: (err: Error) => void;
  lines: string[];
}

export function createEngine(post: (cmd: string) => void): Engine {
  let waiter: Waiter | null = null;
  let chain: Promise<unknown> = Promise.resolve();
  let dead: Error | null = null;

  function onLine(line: string) {
    if (!waiter) return;
    waiter.lines.push(line);
    if (waiter.test(line)) {
      const w = waiter;
      waiter = null;
      w.resolve(w.lines);
    }
  }

  function request(cmds: string[], test: (line: string) => boolean): Promise<string[]> {
    const run = () =>
      new Promise<string[]>((resolve, reject) => {
        if (dead) return reject(dead);
        waiter = { test, resolve, reject, lines: [] };
        cmds.forEach(post);
      });
    const next = chain.then(run, run);
    chain = next;
    return next;
  }

  const ready = () => request(['uci', 'isready'], (l) => l === 'readyok');

  async function evaluate(fen: string, ms: number): Promise<Evaluation> {
    const lines = await request([`position fen ${fen}`, `go movetime ${ms}`], (l) => l.startsWith('bestmove'));
    const info = lines.filter((l) => l.startsWith('info') && / score /.test(l)).pop() ?? '';
    const mate = info.match(/score mate (-?\d+)/);
    let cp = mate ? Math.sign(+mate[1]) * (100000 - Math.abs(+mate[1])) : +(info.match(/score cp (-?\d+)/)?.[1] ?? 0);
    if (fen.split(' ')[1] === 'b') cp = -cp;
    return {
      cp,
      mate: mate ? +mate[1] : null,
      best: lines[lines.length - 1].split(' ')[1],
      depth: +(info.match(/ depth (\d+)/)?.[1] ?? 0),
      nodes: +(info.match(/ nodes (\d+)/)?.[1] ?? 0),
    };
  }

  function fail(err: Error) {
    dead = err;
    const w = waiter;
    waiter = null;
    w?.reject(err);
  }

  return { onLine, ready, evaluate, fail };
}
