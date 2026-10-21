const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Game, levels, directions } = require('../engine.js');
const key = point => `${point.column},${point.row}`;
function path(level, start, target, avoidExit = false) {
  const queue = [{ ...start, steps: [] }], visited = new Set([key(start)]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (key(current) === key(target)) return current.steps;
    for (const [direction, [horizontal, vertical]] of Object.entries(directions)) {
      const next = { column: current.column + horizontal, row: current.row + vertical };
      if (level.grid[next.row]?.[next.column] !== 0 || visited.has(key(next)) || (avoidExit && key(next) === key(level.exit))) continue;
      visited.add(key(next)); queue.push({ ...next, steps: [...current.steps, direction] });
    }
  }
  return null;
}
test('All levels have three reachable items, reachable exit, dead ends and alternative routes', () => {
  for (const level of levels) {
    assert.equal(level.items.length, 3);
    assert.equal(new Set([level.start, level.exit, ...level.items].map(key)).size, 5);
    for (const item of level.items) assert.ok(path(level, level.start, item, true));
    assert.ok(path(level, level.start, level.exit));
    let vertices = 0, degreeSum = 0, deadEnds = 0;
    level.grid.forEach((cells, row) => cells.forEach((wall, column) => {
      if (wall) return;
      vertices++;
      const degree = Object.values(directions).filter(([horizontal, vertical]) => level.grid[row + vertical]?.[column + horizontal] === 0).length;
      degreeSum += degree;
      if (degree === 1) deadEnds++;
      assert.ok(path(level, level.start, { column, row }));
    }));
    assert.ok(deadEnds >= 2);
    assert.ok(degreeSum / 2 >= vertices, 'Connected maze has a cycle');
  }
});
test('Walls and boundaries block movement without adding moves', () => {
  const game = new Game();
  for (const direction of ['up', 'left']) assert.equal(game.move(direction), 'wall');
  assert.deepEqual(game.player, game.level.start); assert.equal(game.moves, 0);
  assert.equal(game.move('unknown'), 'ignored');
});
test('Exit stays locked with missing data', () => {
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    const game = new Game(); game.levelIndex = levelIndex; game.restart();
    const route = path(game.level, game.player, game.level.exit);
    route.slice(0, -1).forEach(direction => game.move(direction));
    game.remaining = game.level.items.map(item => ({ ...item }));
    const moves = game.moves, position = { ...game.player };
    assert.equal(game.move(route.at(-1)), 'locked');
    assert.equal(game.moves, moves); assert.deepEqual(game.player, position);
  }
});
test('Collect, restart, advance through three levels, win and reset', () => {
  const game = new Game();
  let total = 0;
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    assert.equal(game.levelIndex, levelIndex);
    path(game.level, game.player, game.remaining[0], true).forEach(direction => game.move(direction));
    assert.ok(game.remaining.length < 3);
    game.restart(); assert.equal(game.moves, 0); assert.equal(game.remaining.length, 3); assert.deepEqual(game.player, game.level.start);
    while (game.remaining.length) path(game.level, game.player, game.remaining[0], true).forEach(direction => game.move(direction));
    const route = path(game.level, game.player, game.level.exit);
    total += game.moves + route.length;
    let result;
    route.forEach(direction => { result = game.move(direction); });
    assert.equal(result, levelIndex === 2 ? 'won' : 'level');
  }
  assert.equal(game.totalMoves, total); assert.equal(game.won, true);
  assert.equal(game.move('left'), 'ignored');
  game.reset(); assert.equal(game.levelIndex, 0); assert.equal(game.totalMoves, 0); assert.equal(game.won, false); assert.equal(game.remaining.length, 3);
});
