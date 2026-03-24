/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games
 * Purpose: Bomb Blast — multiple levels, bomb types (heavy, bouncer, precision, cluster), short unlock tutorials, admin skip level.
 */
(function () {
  "use strict";

  var ACCESS_KEY = "tutoBombAccess";
  /** Bump version so old sessionStorage keys do not block tutorials forever. */
  var TUTORIAL_SEEN_PREFIX = "tuto_bomb_seen_v2_";
  var TUTORIAL_LEGACY_PREFIX = "tuto_bomb_seen_";
  var TUTORIAL_MAX_MS = 10000;

  /**
   * @returns {boolean}
   */
  function hasAccess() {
    try {
      return sessionStorage.getItem(ACCESS_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  if (!hasAccess()) {
    window.location.replace("lista-jogos.html");
    return;
  }

  var canvas = document.getElementById("bombCanvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var W = 720;
  var H = 420;
  var GROUND = H - 36;
  var SLING = { x: 100, y: GROUND - 40 };
  var GRAVITY = 0.42;
  var EXPLODE_R = 78;
  var POINTS_PER_BLOCK = 100;
  var LEVEL_CLEAR_BONUS_BASE = 250;

  /**
   * @typedef {{ id: string, label: string, explodeR: number, bodyR: number, maxPower: number, pointsMult: number, bounces: number, cluster?: boolean }} BombTypeDef
   */

  /** @type {Record<string, BombTypeDef>} */
  var BOMB_TYPES = {
    normal: { id: "normal", label: "Clássica", explodeR: 1, bodyR: 15, maxPower: 17, pointsMult: 1, bounces: 0 },
    heavy: { id: "heavy", label: "Pesada", explodeR: 1.38, bodyR: 17, maxPower: 14.8, pointsMult: 1, bounces: 0 },
    bouncer: { id: "bouncer", label: "Saltitante", explodeR: 1, bodyR: 15, maxPower: 17, pointsMult: 1, bounces: 1 },
    precision: { id: "precision", label: "Precisão", explodeR: 0.58, bodyR: 12, maxPower: 17, pointsMult: 3, bounces: 0 },
    cluster: { id: "cluster", label: "Cluster", explodeR: 1, bodyR: 15, maxPower: 17, pointsMult: 1, bounces: 0, cluster: true },
  };

  /**
   * @typedef {{ x: number, y: number, w: number, h: number }} Block
   * @typedef {{ blocks: Block[], bombType: string, maxBombs: number }} LevelDef
   */

  var G = GROUND;

  /** @type {LevelDef[]} */
  var LEVELS = [
    {
      bombType: "normal",
      maxBombs: 3,
      blocks: [
        { x: 380, y: G - 50, w: 48, h: 32 },
        { x: 450, y: G - 50, w: 48, h: 32 },
        { x: 520, y: G - 50, w: 48, h: 32 },
      ],
    },
    {
      bombType: "normal",
      maxBombs: 3,
      blocks: [
        { x: 400, y: G - 95, w: 44, h: 30 },
        { x: 470, y: G - 95, w: 44, h: 30 },
        { x: 540, y: G - 95, w: 44, h: 30 },
        { x: 435, y: G - 50, w: 44, h: 30 },
        { x: 505, y: G - 50, w: 44, h: 30 },
        { x: 470, y: G - 140, w: 44, h: 30 },
      ],
    },
    {
      bombType: "normal",
      maxBombs: 3,
      blocks: [
        { x: 360, y: G - 160, w: 40, h: 28 },
        { x: 420, y: G - 160, w: 40, h: 28 },
        { x: 480, y: G - 160, w: 40, h: 28 },
        { x: 540, y: G - 160, w: 40, h: 28 },
        { x: 390, y: G - 115, w: 40, h: 28 },
        { x: 450, y: G - 115, w: 40, h: 28 },
        { x: 510, y: G - 115, w: 40, h: 28 },
        { x: 420, y: G - 70, w: 40, h: 28 },
        { x: 480, y: G - 70, w: 40, h: 28 },
      ],
    },
    {
      bombType: "heavy",
      maxBombs: 4,
      blocks: [
        { x: 300, y: G - 48, w: 46, h: 30 },
        { x: 358, y: G - 48, w: 46, h: 30 },
        { x: 416, y: G - 48, w: 46, h: 30 },
        { x: 474, y: G - 48, w: 46, h: 30 },
        { x: 532, y: G - 48, w: 46, h: 30 },
        { x: 590, y: G - 48, w: 46, h: 30 },
        { x: 360, y: G - 100, w: 46, h: 30 },
        { x: 430, y: G - 100, w: 46, h: 30 },
        { x: 500, y: G - 100, w: 46, h: 30 },
      ],
    },
    {
      bombType: "bouncer",
      maxBombs: 4,
      blocks: [
        { x: 420, y: G - 135, w: 42, h: 28 },
        { x: 478, y: G - 135, w: 42, h: 28 },
        { x: 536, y: G - 135, w: 42, h: 28 },
        { x: 470, y: G - 185, w: 42, h: 28 },
        { x: 340, y: G - 52, w: 44, h: 30 },
        { x: 410, y: G - 52, w: 44, h: 30 },
        { x: 560, y: G - 52, w: 44, h: 30 },
        { x: 630, y: G - 52, w: 44, h: 30 },
      ],
    },
    {
      bombType: "precision",
      maxBombs: 5,
      blocks: [
        { x: 400, y: G - 145, w: 36, h: 24 },
        { x: 448, y: G - 145, w: 36, h: 24 },
        { x: 496, y: G - 145, w: 36, h: 24 },
        { x: 424, y: G - 110, w: 36, h: 24 },
        { x: 472, y: G - 110, w: 36, h: 24 },
        { x: 448, y: G - 75, w: 36, h: 24 },
        { x: 360, y: G - 95, w: 36, h: 24 },
        { x: 520, y: G - 95, w: 36, h: 24 },
        { x: 380, y: G - 52, w: 38, h: 26 },
        { x: 450, y: G - 52, w: 38, h: 26 },
        { x: 520, y: G - 52, w: 38, h: 26 },
      ],
    },
    {
      bombType: "cluster",
      maxBombs: 4,
      blocks: [
        { x: 280, y: G - 55, w: 44, h: 30 },
        { x: 340, y: G - 55, w: 44, h: 30 },
        { x: 400, y: G - 55, w: 44, h: 30 },
        { x: 520, y: G - 55, w: 44, h: 30 },
        { x: 580, y: G - 55, w: 44, h: 30 },
        { x: 640, y: G - 55, w: 44, h: 30 },
        { x: 320, y: G - 115, w: 44, h: 30 },
        { x: 600, y: G - 115, w: 44, h: 30 },
        { x: 450, y: G - 165, w: 44, h: 30 },
      ],
    },
    {
      bombType: "normal",
      maxBombs: 5,
      blocks: [
        { x: 320, y: G - 175, w: 40, h: 28 },
        { x: 380, y: G - 175, w: 40, h: 28 },
        { x: 440, y: G - 175, w: 40, h: 28 },
        { x: 500, y: G - 175, w: 40, h: 28 },
        { x: 560, y: G - 175, w: 40, h: 28 },
        { x: 350, y: G - 130, w: 40, h: 28 },
        { x: 410, y: G - 130, w: 40, h: 28 },
        { x: 470, y: G - 130, w: 40, h: 28 },
        { x: 530, y: G - 130, w: 40, h: 28 },
        { x: 380, y: G - 85, w: 40, h: 28 },
        { x: 440, y: G - 85, w: 40, h: 28 },
        { x: 500, y: G - 85, w: 40, h: 28 },
        { x: 400, y: G - 48, w: 44, h: 30 },
        { x: 470, y: G - 48, w: 44, h: 30 },
        { x: 540, y: G - 48, w: 44, h: 30 },
      ],
    },
  ];

  /** @type {Block[]} */
  var blocks = [];
  var levelIndex = 0;
  var bombsLeft = 3;
  var totalScore = 0;
  var scoreAtLevelStart = 0;
  /** @type {string} */
  var currentBombType = "normal";
  /** @type {{ x: number, y: number, vx: number, vy: number, alive: boolean, kind: string, bouncesLeft: number } | null} */
  var proj = null;
  var dragging = false;
  var aimX = 0;
  var aimY = 0;
  var state = "aim";
  /** @type {{ x: number, y: number, until: number, rScale: number, startAt?: number, clusterTriple?: boolean } | null} */
  var explosionFx = null;
  /** Cluster bomb: split animation before blast rings. */
  /** @type {{ x: number, y: number, t0: number } | null} */
  var clusterSplitFx = null;
  var tutorialActive = false;
  /** @type {number | null} */
  var tutoTimerId = null;

  var hudLevel = document.getElementById("bombHudLevel");
  var hudBombIcons = document.getElementById("bombHudBombIcons");
  var hudBombs = document.getElementById("bombHudBombs");
  var hudScore = document.getElementById("bombHudScore");
  var hudBombName = document.getElementById("bombHudBombName");
  var hudMsg = document.getElementById("bombHudMsg");
  var btnNext = document.getElementById("btnBombNext");
  var btnRetry = document.getElementById("btnBombRetry");
  var btnSkipLevel = document.getElementById("btnBombSkipLevel");
  var btnResetGame = document.getElementById("btnBombResetGame");
  var gameOverlay = document.getElementById("bombGameOverlay");
  var overlayEyebrow = document.getElementById("bombOverlayEyebrow");
  var overlayTitle = document.getElementById("bombOverlayTitle");
  var overlaySub = document.getElementById("bombOverlaySub");
  var overlayScore = document.getElementById("bombOverlayScore");
  var btnOverlayPrimary = document.getElementById("btnBombOverlayPrimary");
  var grandVictoryOverlay = document.getElementById("bombGrandVictoryOverlay");
  var grandVictoryScoreEl = document.getElementById("bombGrandVictoryScore");
  var btnGrandVictoryRestart = document.getElementById("btnBombGrandVictoryRestart");
  var tutoOverlay = document.getElementById("bombTutorialOverlay");
  var tutoTitle = document.getElementById("bombTutoTitle");
  var tutoText = document.getElementById("bombTutoText");
  var tutoVisual = document.getElementById("bombTutoVisual");
  var tutoBarFill = document.getElementById("bombTutoBarFill");
  var tutoTimerEl = document.getElementById("bombTutoTimer");
  var btnTutoClose = document.getElementById("btnBombTutoClose");
  var btnTutoSkipLearn = document.getElementById("btnBombTutoSkipLearn");

  /**
   * @param {string} id
   * @returns {BombTypeDef}
   */
  function getBombDef(id) {
    return BOMB_TYPES[id] || BOMB_TYPES.normal;
  }

  function resize() {
    var wrap = canvas.parentElement;
    if (!wrap) return;
    var maxW = Math.min(720, wrap.clientWidth || 720);
    canvas.style.width = maxW + "px";
    canvas.style.height = maxW * (H / W) + "px";
  }

  function updateHudScore() {
    if (hudScore) hudScore.textContent = String(totalScore);
  }

  /** Mini SVG icons for HUD — one per remaining bomb, matching bomb type. */
  var BOMB_MINI_SVG = {
    normal:
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="14" r="8.5" fill="#27272a" stroke="#18181b" stroke-width="1"/><circle cx="9" cy="11" r="2.2" fill="rgba(255,255,255,0.2)"/><path d="M12 5 L13.5 3 L13 7 Z" fill="#f97316"/></svg>',
    heavy:
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="14" r="9.5" fill="#7f1d1d" stroke="#450a0a" stroke-width="1"/><circle cx="9" cy="10.5" r="2.2" fill="rgba(255,255,255,0.2)"/><path d="M12 4 L14 2 L13 6 Z" fill="#f97316"/></svg>',
    bouncer:
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="14" r="8.5" fill="#166534" stroke="#14532d" stroke-width="1"/><path d="M5 20 L19 20" stroke="#15803d" stroke-width="2"/><path d="M12 5 L13.5 3 L13 7 Z" fill="#f97316"/></svg>',
    precision:
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="14" r="6.5" fill="#0284c7" stroke="#0369a1" stroke-width="1"/><circle cx="12" cy="14" r="10" fill="none" stroke="#f472b6" stroke-width="0.8" stroke-dasharray="2 2"/></svg>',
    cluster:
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="14" r="7" fill="#6b21a8" stroke="#3b0764" stroke-width="1"/><circle cx="7" cy="18" r="2.2" fill="#fbbf24"/><circle cx="17" cy="18" r="2.2" fill="#fbbf24"/><path d="M12 5 L13.5 3 L13 7 Z" fill="#f97316"/></svg>',
  };

  function updateLevelHud() {
    if (!hudLevel) return;
    if (levelIndex >= LEVELS.length - 1) {
      hudLevel.textContent = "Último nível";
      hudLevel.classList.add("bomb-blast-hud__value--last-phase");
    } else {
      hudLevel.textContent = String(levelIndex + 1);
      hudLevel.classList.remove("bomb-blast-hud__value--last-phase");
    }
  }

  function updateBombIconsHud() {
    if (hudBombs) hudBombs.textContent = String(bombsLeft);
    if (!hudBombIcons) return;
    var svgHtml = BOMB_MINI_SVG[currentBombType] || BOMB_MINI_SVG.normal;
    hudBombIcons.innerHTML = "";
    for (var i = 0; i < bombsLeft; i++) {
      var span = document.createElement("span");
      span.className = "bomb-blast-hud__bomb-icon";
      span.innerHTML = svgHtml;
      span.title = getBombDef(currentBombType).label;
      hudBombIcons.appendChild(span);
    }
    var wrap = hudBombIcons.closest(".bomb-blast-hud__item--bombs");
    if (wrap) {
      wrap.setAttribute(
        "aria-label",
        bombsLeft + " bomba(s) " + getBombDef(currentBombType).label + " restante(s) nesta fase"
      );
    }
  }

  /**
   * @returns {boolean}
   */
  function isAdminSession() {
    return typeof window.TUTO_hasAdminAccess === "function" && window.TUTO_hasAdminAccess();
  }

  function updateSkipLevelButton() {
    if (!btnSkipLevel) return;
    var lastLevel = levelIndex >= LEVELS.length - 1;
    var canSkip = isAdminSession() && !lastLevel && !tutorialActive;
    btnSkipLevel.disabled = !canSkip;
    btnSkipLevel.title = lastLevel
      ? "Último nível — não há fase para pular."
      : isAdminSession()
        ? "Pular este nível (somente administrador)"
        : "Disponível apenas com sessão de administrador (senha no rodapé).";
  }

  /**
   * Hides the campaign-complete overlay and clears generated particles.
   */
  function hideGrandVictoryOverlay() {
    if (!grandVictoryOverlay) return;
    grandVictoryOverlay.classList.remove("bomb-grand-victory--visible");
    grandVictoryOverlay.hidden = true;
    grandVictoryOverlay.setAttribute("aria-hidden", "true");
    var conf = document.getElementById("bombGrandVictoryConfetti");
    if (conf) conf.innerHTML = "";
    var stars = document.getElementById("bombGrandVictoryStars");
    if (stars) stars.innerHTML = "";
  }

  /**
   * Populates the star layer with twinkling Unicode star glyphs.
   */
  function fillGrandVictoryStars() {
    var stars = document.getElementById("bombGrandVictoryStars");
    if (!stars) return;
    stars.innerHTML = "";
    var glyphs = ["\u2605", "\u2726", "\u2736", "\u2727"];
    for (var i = 0; i < 52; i++) {
      var s = document.createElement("span");
      s.className = "bomb-grand-victory__star";
      s.setAttribute("aria-hidden", "true");
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 2.2 + "s";
      s.style.fontSize = 9 + Math.random() * 16 + "px";
      stars.appendChild(s);
    }
  }

  /**
   * Spawns falling confetti strips with random timing and colors.
   */
  function fillGrandVictoryConfetti() {
    var conf = document.getElementById("bombGrandVictoryConfetti");
    if (!conf) return;
    conf.innerHTML = "";
    var colors = ["#f472b6", "#a78bfa", "#22d3ee", "#fbbf24", "#34d399", "#fb7185", "#c084fc"];
    for (var i = 0; i < 40; i++) {
      var p = document.createElement("span");
      p.className = "bomb-grand-victory__confetti-piece";
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 2.2 + Math.random() * 2.2 + "s";
      p.style.animationDelay = Math.random() * 1.8 + "s";
      conf.appendChild(p);
    }
  }

  /**
   * Eases the displayed score from 0 to target for the victory panel.
   * @param {HTMLElement} el
   * @param {number} target
   * @param {number} durationMs
   */
  function animateGrandVictoryScore(el, target, durationMs) {
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var p = (now - start) / durationMs;
      if (p >= 1) {
        el.textContent = String(target);
        return;
      }
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.floor(target * ease));
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /**
   * Shows the full-screen grand victory UI: stars, confetti, and score count-up.
   */
  function showGrandVictoryOverlay() {
    if (!grandVictoryOverlay) return;
    if (gameOverlay) {
      gameOverlay.hidden = true;
      gameOverlay.setAttribute("aria-hidden", "true");
      gameOverlay.removeAttribute("data-overlay-kind");
      gameOverlay.classList.remove("bomb-blast-game-overlay--lose");
    }
    fillGrandVictoryStars();
    fillGrandVictoryConfetti();
    grandVictoryOverlay.hidden = false;
    grandVictoryOverlay.setAttribute("aria-hidden", "false");
    if (grandVictoryScoreEl) {
      grandVictoryScoreEl.textContent = "0";
      animateGrandVictoryScore(grandVictoryScoreEl, totalScore, 1500);
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        grandVictoryOverlay.classList.add("bomb-grand-victory--visible");
      });
    });
    if (btnNext) btnNext.hidden = true;
    if (btnRetry) btnRetry.hidden = true;
  }

  function hideGameOverlay() {
    hideGrandVictoryOverlay();
    if (!gameOverlay) return;
    gameOverlay.hidden = true;
    gameOverlay.setAttribute("aria-hidden", "true");
    gameOverlay.removeAttribute("data-overlay-kind");
    gameOverlay.classList.remove("bomb-blast-game-overlay--lose");
  }

  /**
   * @param {"lose"|"levelWin"|"gameWin"} kind
   */
  function showGameOverlay(kind) {
    if (kind === "gameWin") {
      showGrandVictoryOverlay();
      return;
    }
    if (!gameOverlay || !overlayTitle || !overlaySub || !overlayScore || !btnOverlayPrimary) return;
    gameOverlay.hidden = false;
    gameOverlay.setAttribute("aria-hidden", "false");
    gameOverlay.setAttribute("data-overlay-kind", kind);
    gameOverlay.classList.toggle("bomb-blast-game-overlay--lose", kind === "lose");
    overlayScore.textContent = String(totalScore);
    if (kind === "lose") {
      if (overlayEyebrow) overlayEyebrow.textContent = "Que pena!";
      overlayTitle.textContent = "Game Over";
      overlaySub.textContent =
        "Ficaram " +
        blocksRemaining() +
        " bloco(s) e você não tem mais bombas. Tente de novo!";
      btnOverlayPrimary.textContent = "Tentar de novo";
    } else if (kind === "levelWin") {
      if (overlayEyebrow) overlayEyebrow.textContent = "Nível limpo!";
      overlayTitle.textContent = "Nível " + (levelIndex + 1) + " concluído!";
      overlaySub.textContent = "Bônus de fase somado aos seus pontos. Próximo desafio…";
      btnOverlayPrimary.textContent = "Próximo nível";
    }
    if (btnNext) btnNext.hidden = true;
    if (btnRetry) btnRetry.hidden = true;
  }

  /**
   * @param {string} typeId
   * @returns {boolean}
   */
  /**
   * Clears legacy + current tutorial flags so panels can show again (e.g. after full restart).
   */
  function clearBombTutorialStorage() {
    var ids = ["heavy", "bouncer", "precision", "cluster"];
    try {
      for (var i = 0; i < ids.length; i++) {
        sessionStorage.removeItem(TUTORIAL_SEEN_PREFIX + ids[i]);
        sessionStorage.removeItem(TUTORIAL_LEGACY_PREFIX + ids[i]);
      }
    } catch (e) {
      /* ignore */
    }
  }

  function shouldShowBombTutorial(typeId) {
    if (typeId === "normal") return false;
    try {
      return sessionStorage.getItem(TUTORIAL_SEEN_PREFIX + typeId) !== "1";
    } catch (e) {
      return true;
    }
  }

  /**
   * @param {string} typeId
   */
  function markTutorialSeen(typeId) {
    try {
      sessionStorage.setItem(TUTORIAL_SEEN_PREFIX + typeId, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function clearTutorialTimer() {
    if (tutoTimerId !== null) {
      clearInterval(tutoTimerId);
      tutoTimerId = null;
    }
  }

  function closeBombTutorial() {
    clearTutorialTimer();
    if (!tutoOverlay) return;
    tutoOverlay.hidden = true;
    tutoOverlay.setAttribute("aria-hidden", "true");
    tutorialActive = false;
    canvas.style.pointerEvents = "";
    updateSkipLevelButton();
  }

  /**
   * @param {string} typeId
   */
  function showBombTutorial(typeId) {
    if (!tutoOverlay || !tutoTitle || !tutoText || !tutoVisual) return;
    var def = getBombDef(typeId);
    tutoTitle.textContent = "Bomba " + def.label;
    tutoVisual.innerHTML = TUTORIAL_VISUALS[typeId] || TUTORIAL_VISUALS.normal;

    var lines = {
      heavy:
        "Explosão bem <strong>maior</strong> que a clássica — ideal para paredes largas. O tiro é um pouco mais <strong>fraco</strong>; mire alto para cobrir mais área.",
      bouncer:
        "Ao bater no <strong>chão</strong> uma vez, a bomba <strong>quica</strong> em vez de explodir. Use isso para alcançar blocos altos atrás de obstáculos.",
      precision:
        "A área da explosão é <strong>menor</strong>, mas cada bloco vale <strong>três vezes</strong> mais pontos. Bom para mirar no centro dos grupinhos.",
      cluster:
        "Uma explosão <strong>central</strong> e duas <strong>menores</strong> aos lados — ótimo quando os blocos estão espalhados em fileiras.",
    };
    tutoText.innerHTML = lines[typeId] || "";

    tutoOverlay.hidden = false;
    tutoOverlay.setAttribute("aria-hidden", "false");
    tutorialActive = true;
    canvas.style.pointerEvents = "none";
    updateSkipLevelButton();

    var start = Date.now();
    var end = start + TUTORIAL_MAX_MS;

    function tick() {
      var now = Date.now();
      var left = Math.max(0, end - now);
      if (tutoBarFill) {
        tutoBarFill.style.transform = "scaleX(" + left / TUTORIAL_MAX_MS + ")";
      }
      if (tutoTimerEl) {
        tutoTimerEl.textContent =
          left > 0 ? "Fecha automaticamente em " + Math.ceil(left / 1000) + " s" : "Fechando…";
      }
      if (left <= 0) {
        markTutorialSeen(typeId);
        closeBombTutorial();
      }
    }

    tick();
    tutoTimerId = window.setInterval(tick, 120);
  }

  /** SVG illustrations for tutorial panel */
  var TUTORIAL_VISUALS = {
    heavy:
      '<svg width="220" height="90" viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="110" cy="72" rx="55" ry="10" fill="rgba(239,68,68,0.35)"/><circle cx="110" cy="38" r="28" fill="#3f3f46" stroke="#18181b" stroke-width="2"/><circle cx="98" cy="32" r="6" fill="rgba(255,255,255,0.25)"/><path d="M110 10 L118 2 L114 18 Z" fill="#f97316"/><text x="110" y="82" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui">explosão grande</text></svg>',
    bouncer:
      '<svg width="220" height="90" viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="20" y1="75" x2="200" y2="75" stroke="#15803d" stroke-width="6"/><path d="M40 75 Q 70 40 100 75" fill="none" stroke="#ec4899" stroke-width="3" stroke-dasharray="6 4"/><circle cx="100" cy="52" r="12" fill="#22c55e" stroke="#14532d"/><circle cx="130" cy="38" r="10" fill="#94a3b8"/><text x="110" y="88" text-anchor="middle" font-size="10" fill="#64748b" font-family="system-ui">1 quicada no chão</text></svg>',
    precision:
      '<svg width="220" height="90" viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="110" cy="40" r="14" fill="#0ea5e9" stroke="#0369a1" stroke-width="2"/><circle cx="110" cy="40" r="22" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="4 3"/><text x="110" y="78" text-anchor="middle" font-size="11" fill="#64748b" font-family="system-ui">área pequena · pts ×3</text></svg>',
    cluster:
      '<svg width="220" height="90" viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="70" cy="55" rx="22" ry="16" fill="rgba(253,224,71,0.45)"/><ellipse cx="110" cy="55" rx="28" ry="18" fill="rgba(249,115,22,0.5)"/><ellipse cx="150" cy="55" rx="22" ry="16" fill="rgba(253,224,71,0.45)"/><circle cx="70" cy="55" r="8" fill="#27272a"/><circle cx="110" cy="55" r="8" fill="#27272a"/><circle cx="150" cy="55" r="8" fill="#27272a"/><text x="110" y="84" text-anchor="middle" font-size="10" fill="#64748b" font-family="system-ui">3 explosões</text></svg>',
    normal: "",
  };

  /**
   * @param {number} i
   * @param {boolean} resetRunScore
   */
  function loadLevel(i, resetRunScore) {
    if (resetRunScore) {
      totalScore = 0;
      scoreAtLevelStart = 0;
      clearBombTutorialStorage();
    } else {
      scoreAtLevelStart = totalScore;
    }
    levelIndex = i;
    var lvl = LEVELS[i];
    currentBombType = lvl.bombType || "normal";
    bombsLeft = lvl.maxBombs != null ? lvl.maxBombs : 3;
    proj = null;
    state = "aim";
    dragging = false;
    explosionFx = null;
    clusterSplitFx = null;
    closeBombTutorial();

    blocks = lvl.blocks.map(function (b) {
      return { x: b.x, y: b.y, w: b.w, h: b.h };
    });
    updateLevelHud();
    updateBombIconsHud();
    if (hudBombName) hudBombName.textContent = getBombDef(currentBombType).label;
    updateHudScore();
    if (hudMsg) {
      hudMsg.textContent =
        "Puxe a estilingue: a linha rosa mostra a trajetória. Bombas restantes: " + bombsLeft + ".";
    }
    hideGameOverlay();
    if (btnNext) btnNext.hidden = true;
    if (btnRetry) btnRetry.hidden = true;
    updateSkipLevelButton();

    if (shouldShowBombTutorial(currentBombType)) {
      showBombTutorial(currentBombType);
    }
  }

  function blocksRemaining() {
    return blocks.length;
  }

  /**
   * @param {number} ox
   * @param {number} oy
   * @param {number} radiusPx
   * @param {number} pointsMult
   * @returns {number}
   */
  function destroyBlocksInRadius(ox, oy, radiusPx, pointsMult) {
    var before = blocks.length;
    var next = [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var cx = b.x + b.w / 2;
      var cy = b.y + b.h / 2;
      var dx = cx - ox;
      var dy = cy - oy;
      if (dx * dx + dy * dy > radiusPx * radiusPx) {
        next.push(b);
      }
    }
    blocks = next;
    var destroyed = before - blocks.length;
    if (destroyed > 0) {
      totalScore += destroyed * POINTS_PER_BLOCK * pointsMult;
      updateHudScore();
    }
    return destroyed;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} typeId
   */
  function explodeAt(x, y, typeId) {
    var bt = getBombDef(typeId);
    if (bt.cluster) {
      var r = EXPLODE_R * bt.explodeR;
      destroyBlocksInRadius(x, y, r, 1);
      destroyBlocksInRadius(x - 58, y, r * 0.48, 1);
      destroyBlocksInRadius(x + 58, y, r * 0.48, 1);
      var now = Date.now();
      var splitMs = 480;
      clusterSplitFx = { x: x, y: y, t0: now, dur: splitMs };
      explosionFx = {
        x: x,
        y: y,
        startAt: now + splitMs,
        until: now + splitMs + 920,
        rScale: 1.22,
        clusterTriple: true,
      };
    } else {
      destroyBlocksInRadius(x, y, EXPLODE_R * bt.explodeR, bt.pointsMult);
      explosionFx = { x: x, y: y, until: Date.now() + 380, rScale: bt.explodeR };
    }
  }

  function checkWinLose() {
    if (blocksRemaining() === 0) {
      state = "win";
      var bonus = LEVEL_CLEAR_BONUS_BASE * (levelIndex + 1);
      totalScore += bonus;
      updateHudScore();
      if (levelIndex >= LEVELS.length - 1) {
        if (hudMsg) hudMsg.textContent = "Campanha completa! Pontuação final: " + totalScore + ".";
        showGameOverlay("gameWin");
      } else {
        if (hudMsg) hudMsg.textContent = "Bônus +" + bonus + " pts! Toque em Próximo nível.";
        showGameOverlay("levelWin");
      }
      return;
    }
    if (bombsLeft <= 0) {
      state = "lose";
      if (hudMsg) hudMsg.textContent = "Sem bombas! Veja o resultado.";
      showGameOverlay("lose");
      return;
    }
    state = "aim";
  }

  /**
   * @param {number} cx
   * @param {number} cy
   * @param {number} r
   * @param {string} typeId
   */
  function drawCartoonBomb(cx, cy, r, typeId) {
    ctx.save();
    ctx.translate(cx, cy);
    var tint = "#52525b";
    var dark = "#09090b";
    var fuse = "#57534e";
    if (typeId === "heavy") {
      tint = "#7f1d1d";
      dark = "#450a0a";
      fuse = "#991b1b";
    } else if (typeId === "bouncer") {
      tint = "#166534";
      dark = "#14532d";
      fuse = "#15803d";
    } else if (typeId === "precision") {
      tint = "#0369a1";
      dark = "#0c4a6e";
      fuse = "#0284c7";
    } else if (typeId === "cluster") {
      tint = "#6b21a8";
      dark = "#3b0764";
      fuse = "#7e22ce";
    }

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(3, r * 0.35, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    var bodyGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 2, 0, 0, r * 1.05);
    bodyGrad.addColorStop(0, tint);
    bodyGrad.addColorStop(0.45, dark);
    bodyGrad.addColorStop(1, "#020617");
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.35, r * 0.22, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = fuse;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, -r * 0.92);
    ctx.quadraticCurveTo(r * 0.1, -r * 1.15, r * 0.35, -r * 1.35);
    ctx.stroke();

    ctx.fillStyle = "#44403c";
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.92, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(r * 0.35 + 2, -r * 1.35);
    ctx.lineTo(r * 0.5, -r * 1.55);
    ctx.lineTo(r * 0.2, -r * 1.45);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(r * 0.42, -r * 1.48, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fafafa";
    ctx.beginPath();
    ctx.arc(-r * 0.32, -r * 0.08, r * 0.2, 0, Math.PI * 2);
    ctx.arc(r * 0.32, -r * 0.08, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#171717";
    ctx.beginPath();
    ctx.arc(-r * 0.32, -r * 0.06, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.32, -r * 0.06, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, r * 0.18, r * 0.38, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();

    if (typeId === "cluster") {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(-r * 0.9, r * 0.5, 4, 0, Math.PI * 2);
      ctx.arc(r * 0.9, r * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawBackground() {
    var sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "#38bdf8");
    sky.addColorStop(0.45, "#bae6fd");
    sky.addColorStop(1, "#e0f2fe");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    [
      [520, 55, 70],
      [380, 90, 55],
      [200, 40, 45],
      [640, 120, 40],
    ].forEach(function (c) {
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], c[2], c[2] * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    var grass = ctx.createLinearGradient(0, GROUND, 0, H);
    grass.addColorStop(0, "#4ade80");
    grass.addColorStop(0.4, "#22c55e");
    grass.addColorStop(1, "#15803d");
    ctx.fillStyle = grass;
    ctx.fillRect(0, GROUND, W, H - GROUND);

    ctx.fillStyle = "rgba(21, 128, 61, 0.35)";
    for (var gx = 0; gx < W; gx += 14) {
      ctx.fillRect(gx, GROUND + 4, 6, 8);
    }
  }

  function drawBlocks() {
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
      g.addColorStop(0, "#cbd5e1");
      g.addColorStop(0.5, "#94a3b8");
      g.addColorStop(1, "#64748b");
      ctx.fillStyle = g;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x + 4, b.y + b.h * 0.35);
      ctx.lineTo(b.x + b.w - 4, b.y + b.h * 0.35);
      ctx.stroke();
      ctx.fillStyle = "rgba(15,23,42,0.12)";
      ctx.fillRect(b.x, b.y + b.h - 4, b.w, 4);
    }
  }

  function drawSling() {
    ctx.strokeStyle = "#5c4033";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(SLING.x - 22, GROUND);
    ctx.lineTo(SLING.x - 6, SLING.y + 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(SLING.x + 22, GROUND);
    ctx.lineTo(SLING.x + 6, SLING.y + 6);
    ctx.stroke();
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.ellipse(SLING.x, GROUND - 2, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * @param {number} vx
   * @param {number} vy
   * @param {string} bombType
   */
  function drawTrajectoryPreview(vx, vy, bombType) {
    var bt = getBombDef(bombType);
    var bodyR = bt.bodyR;
    var x = SLING.x;
    var y = SLING.y;
    var vx_ = vx;
    var vy_ = vy;
    ctx.strokeStyle = "rgba(236, 72, 153, 0.75)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    var steps = 0;
    var bounced = false;

    while (steps < 180) {
      vy_ += GRAVITY;
      x += vx_;
      y += vy_;
      ctx.lineTo(x, y);
      if (y + bodyR >= GROUND) {
        if (bombType === "bouncer" && bt.bounces > 0 && !bounced) {
          y = GROUND - bodyR - 0.01;
          vy_ = -Math.abs(vy_) * 0.58;
          vx_ *= 0.88;
          bounced = true;
          ctx.lineTo(x, y);
          continue;
        }
        break;
      }
      if (x < -30 || x > W + 30 || y > H + 40) break;
      steps++;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(244, 114, 182, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * @param {number} now
   */
  function drawClusterSplitFx(now) {
    if (!clusterSplitFx) return;
    var age = now - clusterSplitFx.t0;
    var dur = clusterSplitFx.dur || 480;
    if (age > dur) {
      clusterSplitFx = null;
      return;
    }
    var cx = clusterSplitFx.x;
    var cy = clusterSplitFx.y;
    var t = age / dur;
    if (t < 0.3) {
      var pulse = 1 + Math.sin(age * 0.05) * 0.05;
      drawCartoonBomb(cx, cy, 16.5 * pulse, "cluster");
    } else if (t < 0.75) {
      var t2 = (t - 0.3) / 0.45;
      var ease = 1 - (1 - t2) * (1 - t2);
      var sep = 52 * ease;
      drawCartoonBomb(cx - sep, cy, 9.5, "cluster");
      drawCartoonBomb(cx + sep, cy, 9.5, "cluster");
      var cr = 16 * Math.max(0.08, 1 - t2 * 1.1);
      if (cr > 0.5) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t2 * 1.15);
        drawCartoonBomb(cx, cy, cr, "cluster");
        ctx.restore();
      }
    }
  }

  function drawExplosionFx(now) {
    if (!explosionFx || now > explosionFx.until) {
      explosionFx = null;
      return;
    }
    if (explosionFx.startAt && now < explosionFx.startAt) {
      return;
    }

    var start = explosionFx.startAt || explosionFx.until - 400;
    var dur = explosionFx.until - start;
    var t = dur > 0 ? 1 - (explosionFx.until - now) / dur : 1;
    t = Math.max(0, Math.min(1, t));
    var baseR = EXPLODE_R * (explosionFx.rScale || 1);

    if (explosionFx.clusterTriple) {
      var offsets = [-58, 0, 58];
      for (var k = 0; k < 3; k++) {
        var localT = Math.min(1, t + k * 0.08);
        var bx = explosionFx.x + offsets[k];
        var by = explosionFx.y;
        var r = baseR * 0.52 * (0.35 + localT * 0.85);
        ctx.save();
        ctx.globalAlpha = (1 - localT * 0.82) * 0.95;
        var grd = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        grd.addColorStop(0, "rgba(253, 224, 71, 0.92)");
        grd.addColorStop(0.45, "rgba(249, 115, 22, 0.55)");
        grd.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return;
    }

    var r = baseR * (0.4 + t * 0.85);
    ctx.save();
    ctx.globalAlpha = 1 - t * 0.85;
    var grd = ctx.createRadialGradient(explosionFx.x, explosionFx.y, 0, explosionFx.x, explosionFx.y, r);
    grd.addColorStop(0, "rgba(253, 224, 71, 0.9)");
    grd.addColorStop(0.45, "rgba(249, 115, 22, 0.55)");
    grd.addColorStop(1, "rgba(239, 68, 68, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(explosionFx.x, explosionFx.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawScene(now) {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawSling();
    drawBlocks();

    if (clusterSplitFx) {
      drawClusterSplitFx(now);
    }

    if (explosionFx) {
      drawExplosionFx(now);
    }

    if (state === "aim" || state === "fly") {
      if (dragging && state === "aim" && bombsLeft > 0 && !tutorialActive) {
        var dx = SLING.x - aimX;
        var dy = SLING.y - aimY;
        var mag = Math.hypot(dx, dy);
        if (mag >= 8) {
          var bt = getBombDef(currentBombType);
          var power = Math.min(1, mag / 160) * bt.maxPower;
          var nx = dx / mag;
          var ny = dy / mag;
          drawTrajectoryPreview(nx * power, ny * power, currentBombType);
        }
        ctx.strokeStyle = "rgba(190, 24, 93, 0.65)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(SLING.x - 8, SLING.y);
        ctx.lineTo(aimX, aimY);
        ctx.moveTo(SLING.x + 8, SLING.y);
        ctx.lineTo(aimX, aimY);
        ctx.stroke();
      }
      if (!proj || !proj.alive) {
        drawCartoonBomb(SLING.x, SLING.y, getBombDef(currentBombType).bodyR, currentBombType);
      }
    }

    if (proj && proj.alive) {
      drawCartoonBomb(proj.x, proj.y, getBombDef(proj.kind).bodyR, proj.kind);
    }

    if (state === "win" || state === "lose") {
      ctx.fillStyle = "rgba(15, 23, 42, 0.12)";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function loop() {
    var t = Date.now();
    if (proj && proj.alive && state === "fly") {
      var pdef = getBombDef(proj.kind);
      var pr = pdef.bodyR;

      proj.vy += GRAVITY;
      proj.x += proj.vx;
      proj.y += proj.vy;

      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        var cx = proj.x;
        var cy = proj.y;
        var nx = Math.max(b.x, Math.min(cx, b.x + b.w));
        var ny = Math.max(b.y, Math.min(cy, b.y + b.h));
        var dx = cx - nx;
        var dy = cy - ny;
        if (dx * dx + dy * dy < pr * pr) {
          explodeAt(proj.x, proj.y, proj.kind);
          proj = null;
          checkWinLose();
          break;
        }
      }

      if (proj && proj.alive) {
        if (proj.y + pr >= GROUND) {
          if (proj.bouncesLeft > 0) {
            proj.y = GROUND - pr - 0.05;
            proj.vy = -Math.abs(proj.vy) * 0.58;
            proj.vx *= 0.88;
            proj.bouncesLeft -= 1;
          } else {
            explodeAt(proj.x, GROUND - pr, proj.kind);
            proj = null;
            checkWinLose();
          }
        } else if (proj.x < -40 || proj.x > W + 40 || proj.y < -100) {
          proj = null;
          checkWinLose();
        }
      }
    }
    drawScene(t);
    requestAnimationFrame(loop);
  }

  /**
   * @param {number} clientX
   * @param {number} clientY
   */
  function canvasPos(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = W / rect.width;
    var scaleY = H / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener("pointerdown", function (e) {
    if (tutorialActive || state !== "aim" || bombsLeft <= 0) return;
    var p = canvasPos(e.clientX, e.clientY);
    var d = Math.hypot(p.x - SLING.x, p.y - SLING.y);
    if (d < 48) {
      dragging = true;
      aimX = p.x;
      aimY = p.y;
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var p = canvasPos(e.clientX, e.clientY);
    aimX = p.x;
    aimY = p.y;
  });

  canvas.addEventListener("pointerup", function (e) {
    if (!dragging) return;
    dragging = false;
    canvas.releasePointerCapture(e.pointerId);
    if (tutorialActive || state !== "aim" || bombsLeft <= 0) return;
    var dx = SLING.x - aimX;
    var dy = SLING.y - aimY;
    var mag = Math.hypot(dx, dy);
    if (mag < 8) return;
    var bt = getBombDef(currentBombType);
    var power = Math.min(1, mag / 160) * bt.maxPower;
    var nx = dx / mag;
    var ny = dy / mag;
    bombsLeft -= 1;
    updateBombIconsHud();
    proj = {
      x: SLING.x,
      y: SLING.y,
      vx: nx * power,
      vy: ny * power,
      alive: true,
      kind: currentBombType,
      bouncesLeft: bt.bounces,
    };
    state = "fly";
  });

  if (btnTutoClose) {
    btnTutoClose.addEventListener("click", function () {
      if (tutoOverlay && !tutoOverlay.hidden && currentBombType) {
        markTutorialSeen(currentBombType);
      }
      closeBombTutorial();
    });
  }
  if (btnTutoSkipLearn) {
    btnTutoSkipLearn.addEventListener("click", function () {
      if (tutoOverlay && !tutoOverlay.hidden && currentBombType) {
        markTutorialSeen(currentBombType);
      }
      closeBombTutorial();
    });
  }

  if (btnOverlayPrimary) {
    btnOverlayPrimary.addEventListener("click", function () {
      if (!gameOverlay || gameOverlay.hidden) return;
      var kind = gameOverlay.getAttribute("data-overlay-kind") || "";
      hideGameOverlay();
      if (kind === "lose") {
        totalScore = scoreAtLevelStart;
        updateHudScore();
        loadLevel(levelIndex, false);
        return;
      }
      if (kind === "levelWin" && levelIndex < LEVELS.length - 1) {
        loadLevel(levelIndex + 1, false);
      }
    });
  }

  if (btnGrandVictoryRestart) {
    btnGrandVictoryRestart.addEventListener("click", function () {
      hideGrandVictoryOverlay();
      loadLevel(0, true);
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (levelIndex < LEVELS.length - 1) {
        loadLevel(levelIndex + 1, false);
      }
    });
  }
  if (btnRetry) {
    btnRetry.addEventListener("click", function () {
      totalScore = scoreAtLevelStart;
      updateHudScore();
      loadLevel(levelIndex, false);
    });
  }

  if (btnSkipLevel) {
    btnSkipLevel.addEventListener("click", function () {
      if (!isAdminSession() || levelIndex >= LEVELS.length - 1 || tutorialActive) return;
      loadLevel(levelIndex + 1, false);
    });
  }

  if (btnResetGame) {
    btnResetGame.addEventListener("click", function () {
      if (
        !window.confirm(
          "Reiniciar o jogo do nível 1? Toda a pontuação será zerada."
        )
      ) {
        return;
      }
      loadLevel(0, true);
    });
  }

  window.addEventListener("tuto-admin-unlocked", function () {
    updateSkipLevelButton();
  });

  canvas.width = W;
  canvas.height = H;
  resize();
  window.addEventListener("resize", resize);
  loadLevel(0, true);
  requestAnimationFrame(loop);
})();
