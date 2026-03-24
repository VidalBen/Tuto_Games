/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games in-browser Tetris
 * Purpose: Classic Tetris with start/pause/game-over, score/level/lines, keyboard controls; sidebar list from GAMES_DATA.
 */
(function () {
  "use strict";

  var COLS = 10;
  var ROWS = 20;
  var BLOCK_PX = 22;
  var HOME_LIST_LIMIT = 20;

  /** @type {string[][]} */
  var board = [];
  /** @type {{matrix:number[][],color:string,x:number,y:number}|null} */
  var piece = null;
  var score = 0;
  var linesTotal = 0;
  var level = 1;
  var gameState = "idle";
  /** @type {number|null} */
  var tickId = null;
  var lastTick = 0;
  var dropMs = 800;

  var COLORS = ["#00f0f0", "#f0f000", "#a000f0", "#00f000", "#f00000", "#0000f0", "#f0a000"];

  /**
   * Four rotation states per piece; each cell 0/1 in 4x4 grid.
   * @type {number[][][][]}
   */
  var SHAPES = [
    [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
    [
      [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      [
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  ];

  function emptyBoard() {
    board = [];
    for (var y = 0; y < ROWS; y++) {
      var row = [];
      for (var x = 0; x < COLS; x++) row.push("");
      board.push(row);
    }
  }

  /**
   * @param {number[][]} matrix
   * @returns {{w:number,h:number,cells:[number,number][]}}
   */
  function emptyRow() {
    var row = [];
    for (var x = 0; x < COLS; x++) row.push("");
    return row;
  }

  /**
   * @param {number} typeIdx
   * @param {number} rot
   * @returns {boolean}
   */
  function collide(typeIdx, rot, px, py) {
    var m = SHAPES[typeIdx][rot % 4];
    for (var y = 0; y < m.length; y++) {
      for (var x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;
        var bx = px + x;
        var by = py + y;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && board[by][bx]) return true;
      }
    }
    return false;
  }

  function spawnPiece() {
    var typeIdx = Math.floor(Math.random() * SHAPES.length);
    var rot = 0;
    var m = SHAPES[typeIdx][rot];
    var cells = [];
    for (var y = 0; y < m.length; y++) {
      for (var x = 0; x < m[y].length; x++) {
        if (m[y][x]) cells.push([x, y]);
      }
    }
    if (!cells.length) {
      piece = null;
      gameOver();
      return;
    }
    var minX = Math.min.apply(
      null,
      cells.map(function (c) {
        return c[0];
      })
    );
    var maxX = Math.max.apply(
      null,
      cells.map(function (c) {
        return c[0];
      })
    );
    var w = maxX - minX + 1;
    var startX = Math.floor((COLS - w) / 2) - minX;
    for (var tryY = -3; tryY <= 0; tryY++) {
      if (!collide(typeIdx, rot, startX, tryY)) {
        piece = { typeIdx: typeIdx, rot: rot, x: startX, y: tryY, color: COLORS[typeIdx] };
        return;
      }
    }
    piece = null;
    gameOver();
  }

  function mergePiece() {
    if (!piece) return;
    var m = SHAPES[piece.typeIdx][piece.rot % 4];
    for (var y = 0; y < m.length; y++) {
      for (var x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;
        var bx = piece.x + x;
        var by = piece.y + y;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) board[by][bx] = piece.color;
      }
    }
  }

  function clearLines() {
    var cleared = 0;
    var again = true;
    while (again) {
      again = false;
      for (var y = ROWS - 1; y >= 0; y--) {
        var full = true;
        for (var x = 0; x < COLS; x++) {
          if (!board[y][x]) {
            full = false;
            break;
          }
        }
        if (full) {
          cleared++;
          board.splice(y, 1);
          board.unshift(emptyRow());
          again = true;
          break;
        }
      }
    }
    if (cleared > 0) {
      linesTotal += cleared;
      var pts = [0, 100, 300, 500, 800];
      score += (pts[cleared] || 0) * level;
      level = Math.min(15, 1 + Math.floor(linesTotal / 10));
      dropMs = Math.max(120, 800 - (level - 1) * 45);
    }
  }

  function gameOver() {
    gameState = "over";
    stopLoop();
    var ov = document.getElementById("tetrisOverlay");
    var title = document.getElementById("tetrisOverlayTitle");
    var sub = document.getElementById("tetrisOverlaySub");
    var btnOv = document.getElementById("btnTetrisOverlayPrimary");
    if (ov) ov.hidden = false;
    if (title) title.textContent = "Game over";
    if (sub) sub.textContent = "Pontuação: " + score + " · Linhas: " + linesTotal;
    if (btnOv) btnOv.textContent = "Jogar de novo";
    setButtons();
  }

  function stopLoop() {
    if (tickId !== null) {
      cancelAnimationFrame(tickId);
      tickId = null;
    }
    lastTick = 0;
  }

  function setButtons() {
    var btnStart = document.getElementById("btnTetrisStart");
    var btnPause = document.getElementById("btnTetrisPause");
    var btnRestart = document.getElementById("btnTetrisRestart");
    if (btnStart) {
      btnStart.disabled = gameState === "playing";
      btnStart.textContent = "Iniciar";
    }
    if (btnPause) {
      btnPause.disabled = gameState !== "playing" && gameState !== "paused";
      btnPause.textContent = gameState === "paused" ? "Continuar" : "Pausar";
    }
    if (btnRestart) {
      btnRestart.disabled = gameState === "idle";
    }
  }

  function updateHud() {
    var elS = document.getElementById("tetrisScore");
    var elL = document.getElementById("tetrisLines");
    var elLv = document.getElementById("tetrisLevel");
    if (elS) elS.textContent = String(score);
    if (elL) elL.textContent = String(linesTotal);
    if (elLv) elLv.textContent = String(level);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  function draw(ctx) {
    var w = COLS * BLOCK_PX;
    var h = ROWS * BLOCK_PX;
    ctx.fillStyle = "#0a0f18";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    for (var gx = 0; gx <= COLS; gx++) {
      ctx.beginPath();
      ctx.moveTo(gx * BLOCK_PX, 0);
      ctx.lineTo(gx * BLOCK_PX, h);
      ctx.stroke();
    }
    for (var gy = 0; gy <= ROWS; gy++) {
      ctx.beginPath();
      ctx.moveTo(0, gy * BLOCK_PX);
      ctx.lineTo(w, gy * BLOCK_PX);
      ctx.stroke();
    }
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (board[y][x]) {
          drawBlock(ctx, x, y, board[y][x]);
        }
      }
    }
    if (piece) {
      var m = SHAPES[piece.typeIdx][piece.rot % 4];
      for (var py = 0; py < m.length; py++) {
        for (var px = 0; px < m[py].length; px++) {
          if (!m[py][px]) continue;
          var bx = piece.x + px;
          var by = piece.y + py;
          if (by >= 0) drawBlock(ctx, bx, by, piece.color);
        }
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  function drawBlock(ctx, x, y, color) {
    var px = x * BLOCK_PX;
    var py = y * BLOCK_PX;
    var g = ctx.createLinearGradient(px, py, px + BLOCK_PX, py + BLOCK_PX);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(px + 1, py + 1, BLOCK_PX - 2, BLOCK_PX - 2);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 1, py + 1, BLOCK_PX - 2, BLOCK_PX - 2);
  }

  function tick(ts) {
    if (gameState !== "playing") return;
    if (!lastTick) lastTick = ts;
    var elapsed = ts - lastTick;
    if (elapsed >= dropMs) {
      lastTick = ts;
      if (!piece) spawnPiece();
      if (piece && !collide(piece.typeIdx, piece.rot, piece.x, piece.y + 1)) {
        piece.y++;
      } else if (piece) {
        mergePiece();
        clearLines();
        updateHud();
        spawnPiece();
        if (!piece) return;
      }
    }
    var canvas = document.getElementById("tetrisCanvas");
    if (canvas) {
      var ctx = canvas.getContext("2d");
      if (ctx) draw(ctx);
    }
    tickId = requestAnimationFrame(tick);
  }

  function startLoop() {
    stopLoop();
    lastTick = 0;
    tickId = requestAnimationFrame(tick);
  }

  function initGame() {
    emptyBoard();
    score = 0;
    linesTotal = 0;
    level = 1;
    dropMs = 800;
    piece = null;
    updateHud();
    spawnPiece();
    var ov = document.getElementById("tetrisOverlay");
    if (ov) ov.hidden = true;
  }

  function startOrRestart() {
    initGame();
    gameState = "playing";
    setButtons();
    var canvas = document.getElementById("tetrisCanvas");
    if (canvas) {
      var ctx = canvas.getContext("2d");
      if (ctx) draw(ctx);
    }
    startLoop();
  }

  function togglePause() {
    if (gameState !== "playing" && gameState !== "paused") return;
    var btnOv = document.getElementById("btnTetrisOverlayPrimary");
    if (gameState === "playing") {
      gameState = "paused";
      stopLoop();
      var ov = document.getElementById("tetrisOverlay");
      var title = document.getElementById("tetrisOverlayTitle");
      var sub = document.getElementById("tetrisOverlaySub");
      if (ov) ov.hidden = false;
      if (title) title.textContent = "Pausado";
      if (sub) sub.textContent = "Clique em Continuar abaixo, no botão da barra ou pressione Esc.";
      if (btnOv) btnOv.textContent = "Continuar";
    } else if (gameState === "paused") {
      gameState = "playing";
      var ov2 = document.getElementById("tetrisOverlay");
      if (ov2) ov2.hidden = true;
      if (btnOv) btnOv.textContent = "Iniciar";
      lastTick = 0;
      startLoop();
    }
    setButtons();
  }

  function hardDrop() {
    if (gameState !== "playing" || !piece) return;
    while (!collide(piece.typeIdx, piece.rot, piece.x, piece.y + 1)) {
      piece.y++;
      score += 2;
    }
    mergePiece();
    clearLines();
    updateHud();
    spawnPiece();
    if (!piece) return;
    var canvas = document.getElementById("tetrisCanvas");
    if (canvas) {
      var ctx = canvas.getContext("2d");
      if (ctx) draw(ctx);
    }
  }

  function tryMove(dx, dy) {
    if (gameState !== "playing" || !piece) return;
    if (!collide(piece.typeIdx, piece.rot, piece.x + dx, piece.y + dy)) {
      piece.x += dx;
      piece.y += dy;
      if (dy > 0) score += 1;
    }
  }

  function tryRotate() {
    if (gameState !== "playing" || !piece) return;
    var next = (piece.rot + 1) % 4;
    if (!collide(piece.typeIdx, next, piece.x, piece.y)) {
      piece.rot = next;
      return;
    }
    for (var kick = -1; kick <= 2; kick++) {
      if (!collide(piece.typeIdx, next, piece.x + kick, piece.y)) {
        piece.rot = next;
        piece.x += kick;
        return;
      }
    }
  }

  function onKeyDown(e) {
    if (e.code === "Escape") {
      if (gameState === "playing" || gameState === "paused") {
        e.preventDefault();
        togglePause();
      }
      return;
    }
    if (gameState !== "playing") return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].indexOf(e.code) === -1) return;
    if (e.code === "Space") {
      e.preventDefault();
      hardDrop();
      return;
    }
    if (e.code.indexOf("Arrow") === 0) e.preventDefault();
    if (e.code === "ArrowLeft") tryMove(-1, 0);
    else if (e.code === "ArrowRight") tryMove(1, 0);
    else if (e.code === "ArrowDown") tryMove(0, 1);
    else if (e.code === "ArrowUp") tryRotate();
    var canvas = document.getElementById("tetrisCanvas");
    if (canvas) {
      var ctx = canvas.getContext("2d");
      if (ctx) draw(ctx);
    }
  }

  function renderSidebar() {
    var root = document.getElementById("tetrisGamesList");
    if (!root || typeof window.GAMES_DATA === "undefined") return;
    var data = window.GAMES_DATA;
    var frag = document.createDocumentFragment();
    var n = Math.min(HOME_LIST_LIMIT, data.length);
    for (var i = 0; i < n; i++) {
      var g = data[i];
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "wiki-jogo.html#" + encodeURIComponent(g.slug);
      a.textContent = g.name;
      li.appendChild(a);
      frag.appendChild(li);
    }
    root.innerHTML = "";
    root.appendChild(frag);
  }

  function init() {
    var canvas = document.getElementById("tetrisCanvas");
    if (!canvas) return;
    canvas.width = COLS * BLOCK_PX;
    canvas.height = ROWS * BLOCK_PX;
    var ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0a0f18";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function onOverlayPrimaryClick() {
      if (gameState === "paused") {
        togglePause();
        return;
      }
      startOrRestart();
    }

    document.getElementById("btnTetrisStart") &&
      document.getElementById("btnTetrisStart").addEventListener("click", function () {
        if (gameState === "playing") return;
        startOrRestart();
      });
    document.getElementById("btnTetrisOverlayPrimary") &&
      document.getElementById("btnTetrisOverlayPrimary").addEventListener("click", onOverlayPrimaryClick);
    document.getElementById("btnTetrisPause") &&
      document.getElementById("btnTetrisPause").addEventListener("click", function () {
        togglePause();
      });
    document.getElementById("btnTetrisRestart") &&
      document.getElementById("btnTetrisRestart").addEventListener("click", function () {
        startOrRestart();
      });
    window.addEventListener("keydown", onKeyDown);

    renderSidebar();
    setButtons();
    updateHud();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
