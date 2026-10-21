'use strict';
const game = new DataMaze.Game();
const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
const byId = id => document.getElementById(id);
function render() {
  const level = game.level;
  const size = canvas.width / level.grid.length;
  context.fillStyle = '#0b1219';
  context.fillRect(0, 0, canvas.width, canvas.height);
  level.grid.forEach((cells, row) => cells.forEach((wall, column) => {
    context.fillStyle = wall ? '#293c49' : '#101d27';
    context.fillRect(column * size + 1, row * size + 1, size - 2, size - 2);
    if (wall) { context.fillStyle = '#35505e'; context.fillRect(column * size + 1, row * size + 1, size - 2, 2); }
  }));
  const exitColumn = (level.exit.column + .5) * size, exitRow = (level.exit.row + .5) * size;
  context.strokeStyle = game.remaining.length ? '#b1764e' : '#ffbc7b';
  context.lineWidth = Math.max(2, size * .06);
  context.strokeRect(exitColumn - size * .3, exitRow - size * .34, size * .6, size * .68);
  context.fillStyle = context.strokeStyle;
  context.font = `bold ${size * .35}px sans-serif`;
  context.textAlign = 'center'; context.textBaseline = 'middle';
  context.fillText(game.remaining.length ? '×' : '↗', exitColumn, exitRow);
  game.remaining.forEach(item => {
    const column = (item.column + .5) * size, row = (item.row + .5) * size;
    context.fillStyle = '#83d5f7';
    context.beginPath(); context.moveTo(column, row - size * .23); context.lineTo(column + size * .23, row); context.lineTo(column, row + size * .23); context.lineTo(column - size * .23, row); context.closePath(); context.fill();
    context.fillStyle = '#152938'; context.fillRect(column - size * .05, row - size * .05, size * .1, size * .1);
  });
  const playerColumn = (game.player.column + .5) * size, playerRow = (game.player.row + .5) * size;
  context.fillStyle = '#c9f56c'; context.beginPath(); context.arc(playerColumn, playerRow, size * .29, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#14200a'; context.beginPath(); context.arc(playerColumn + size * .07, playerRow - size * .07, size * .055, 0, Math.PI * 2); context.fill();
  byId('level').textContent = `${game.levelIndex + 1} / 3`;
  document.querySelector('.chapter').firstChild.textContent = `0${game.levelIndex + 1} `;
  byId('level-name').textContent = level.title; byId('level-copy').textContent = level.description;
  byId('moves').textContent = game.moves; byId('remaining').textContent = game.remaining.length;
  byId('status').textContent = game.message;
  canvas.setAttribute('aria-label', `Лабиринт, уровень ${game.levelIndex + 1}. Позиция: столбец ${game.player.column}, строка ${game.player.row}. Осталось фрагментов: ${game.remaining.length}. Стрелки — движение, R — перезапуск.`);
  byId('finish').hidden = !game.won;
  byId('restart').disabled = game.won;
  byId('result').textContent = `Пройдено 3 уровня. Собрано 9 фрагментов. Ходов: ${game.totalMoves}.`;
}
function move(direction) { game.move(direction); render(); }
const keyDirections = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (keyDirections[event.key]) { event.preventDefault(); move(keyDirections[event.key]); }
  else if (event.code === 'KeyR' || event.key.toLowerCase() === 'r' || event.key.toLowerCase() === 'к') { event.preventDefault(); game.won ? game.reset() : game.restart(); render(); }
});
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => move(button.dataset.direction)));
byId('restart').addEventListener('click', () => { game.restart(); render(); });
byId('again').addEventListener('click', () => { game.reset(); render(); canvas.focus(); });
render();
