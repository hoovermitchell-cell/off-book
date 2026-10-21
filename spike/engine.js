// Minimal UCI client. `post` sends a command; feed every engine output line to `onLine`.
// Requests run one at a time. Scores come back from White's point of view.
export function createEngine(post) {
  let waiter = null; // { test, resolve, lines }
  let chain = Promise.resolve();

  function onLine(line) {
    if (!waiter) return;
    waiter.lines.push(line);
    if (waiter.test(line)) { const w = waiter; waiter = null; w.resolve(w.lines); }
  }

  function request(cmds, test) {
    const run = () => new Promise((resolve) => {
      waiter = { test, resolve, lines: [] };
      cmds.forEach(post);
    });
    return (chain = chain.then(run, run));
  }

  const ready = () => request(['uci', 'isready'], (l) => l === 'readyok');

  async function evaluate(fen, ms) {
    const lines = await request([`position fen ${fen}`, `go movetime ${ms}`], (l) => l.startsWith('bestmove'));
    const info = lines.filter((l) => l.startsWith('info') && / score /.test(l)).pop() ?? '';
    const mate = info.match(/score mate (-?\d+)/);
    let cp = mate ? Math.sign(+mate[1]) * (100000 - Math.abs(+mate[1])) : +(info.match(/score cp (-?\d+)/)?.[1] ?? 0);
    if (fen.split(' ')[1] === 'b') cp = -cp;
    return {
      cp,
      mate: mate ? +mate[1] : null,
      best: lines.at(-1).split(' ')[1],
      depth: +(info.match(/ depth (\d+)/)?.[1] ?? 0),
      nodes: +(info.match(/ nodes (\d+)/)?.[1] ?? 0),
    };
  }

  return { onLine, ready, evaluate };
}
