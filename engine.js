(function (root) {
  'use strict';
  const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  function makeLevel(size, seed, title, description) {
    const grid = Array.from({ length: size }, () => Array(size).fill(1));
    function random(limit) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % limit;
    }
    const stack = [[1, 1]];
    grid[1][1] = 0;
    while (stack.length) {
      const [column, row] = stack[stack.length - 1];
      const candidates = Object.values(directions).map(([horizontal, vertical]) => [column + horizontal * 2, row + vertical * 2]).filter(([nextColumn, nextRow]) => nextColumn > 0 && nextRow > 0 && nextColumn < size - 1 && nextRow < size - 1 && grid[nextRow][nextColumn] === 1);
      if (!candidates.length) { stack.pop(); continue; }
      const [nextColumn, nextRow] = candidates[random(candidates.length)];
      grid[(row + nextRow) / 2][(column + nextColumn) / 2] = 0;
      grid[nextRow][nextColumn] = 0;
      stack.push([nextColumn, nextRow]);
    }
    const bridges = [];
    for (let row = 2; row < size - 2; row++) {
      for (let column = 2; column < size - 2; column++) {
        if (grid[row][column] && ((row % 2 === 1 && column % 2 === 0) || (row % 2 === 0 && column % 2 === 1))) bridges.push([column, row]);
      }
    }
    for (let count = 0; count < 2 && bridges.length; count++) {
      const [column, row] = bridges.splice(random(bridges.length), 1)[0];
      grid[row][column] = 0;
    }
    const start = { column: 1, row: 1 };
    const distance = Array.from({ length: size }, () => Array(size).fill(-1));
    distance[1][1] = 0;
    const queue = [start];
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      for (const [horizontal, vertical] of Object.values(directions)) {
        const column = current.column + horizontal, row = current.row + vertical;
        if (grid[row]?.[column] === 0 && distance[row][column] < 0) {
          distance[row][column] = distance[current.row][current.column] + 1;
          queue.push({ column, row });
        }
      }
    }
    const farthest = queue.slice(1).sort((first, second) => distance[second.row][second.column] - distance[first.row][first.column]);
    const exit = farthest[0];
    const items = [farthest[1], farthest[Math.floor(farthest.length * .4)], farthest[Math.floor(farthest.length * .7)]];
    return { grid, start, exit, items, title, description };
  }
  const levels = [
    makeLevel(13, 17, 'Входной шлюз', 'Первый узел: исследуйте ответвления и соберите фрагменты.'),
    makeLevel(15, 83, 'Перекрёсток потоков', 'Больше коридоров. Сравнивайте пути и возвращайтесь к развилкам.'),
    makeLevel(17, 219, 'Ядро системы', 'Последний узел: найдите все данные и восстановите связь.')
  ];
  class Game {
    constructor() { this.levelIndex = 0; this.totalMoves = 0; this.restart(); }
    get level() { return levels[this.levelIndex]; }
    restart() {
      this.player = { ...this.level.start };
      this.remaining = this.level.items.map(item => ({ ...item }));
      this.moves = 0;
      this.won = false;
      this.message = 'Соберите три фрагмента данных.';
    }
    reset() { this.levelIndex = 0; this.totalMoves = 0; this.restart(); }
    move(direction) {
      if (this.won || !directions[direction]) return 'ignored';
      const [horizontal, vertical] = directions[direction];
      const column = this.player.column + horizontal, row = this.player.row + vertical;
      if (this.level.grid[row]?.[column] !== 0) { this.message = 'Здесь стена. Выберите другой путь.'; return 'wall'; }
      if (column === this.level.exit.column && row === this.level.exit.row && this.remaining.length) {
        this.message = `Выход закрыт. Осталось фрагментов: ${this.remaining.length}.`;
        return 'locked';
      }
      this.player = { column, row };
      this.moves++;
      const before = this.remaining.length;
      this.remaining = this.remaining.filter(item => item.column !== column || item.row !== row);
      this.message = before !== this.remaining.length ? (this.remaining.length ? `Фрагмент получен! Осталось: ${this.remaining.length}.` : 'Все фрагменты собраны. Направляйтесь к выходу!') : (this.remaining.length ? 'Исследуйте коридоры и соберите данные.' : 'Выход открыт. Найдите оранжевые ворота.');
      if (column === this.level.exit.column && row === this.level.exit.row) {
        this.totalMoves += this.moves;
        if (this.levelIndex === levels.length - 1) { this.won = true; this.message = 'Система восстановлена. Все три уровня пройдены!'; return 'won'; }
        this.levelIndex++;
        this.restart();
        this.message = 'Новый узел открыт. Соберите следующие три фрагмента.';
        return 'level';
      }
      return before !== this.remaining.length ? 'collected' : 'moved';
    }
  }
  const api = { Game, levels, directions };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DataMaze = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
