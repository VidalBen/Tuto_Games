/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games full catalog
 * Purpose: Render games by category (Roblox, outros, antigo, infantis) in collapsible sections with card grids; wiki link goes to wiki-jogo.html#slug (full guide).
 */

(function () {
  "use strict";

  /**
   * Resolves catalog bucket when `category` is omitted (legacy entries).
   * @param {{ roblox?: boolean, category?: string }} g
   * @returns {"roblox"|"outros"|"antigo"|"infantis"}
   */
  function getCategory(g) {
    if (g.category === "antigo" || g.category === "infantis") return g.category;
    if (g.category === "roblox" || g.category === "outros") return g.category;
    return g.roblox ? "roblox" : "outros";
  }

  /**
   * @param {{ slug: string, name: string, year: number, type: string, platforms: string, story: string, imageUrl: string, roblox: boolean, category?: string }} g
   * @returns {HTMLElement}
   */
  function buildCard(g) {
    var article = document.createElement("article");
    article.className = "game-card";
    var cat = getCategory(g);
    if (cat === "roblox") article.classList.add("game-card--roblox");
    else if (cat === "antigo") article.classList.add("game-card--antigo");
    else if (cat === "infantis") article.classList.add("game-card--infantis");

    var imgWrap = document.createElement("div");
    imgWrap.className = "game-card__media";
    var img = document.createElement("img");
    img.src = g.imageUrl;
    img.alt = g.name;
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 480;
    img.height = 270;
    imgWrap.appendChild(img);

    var body = document.createElement("div");
    body.className = "game-card__body";

    var h2 = document.createElement("h2");
    h2.className = "game-card__title";
    h2.textContent = g.name;

    var meta = document.createElement("p");
    meta.className = "game-card__meta";
    meta.textContent =
      g.year +
      " · " +
      g.type +
      " · " +
      g.platforms +
      (cat === "roblox" ? " · Roblox" : cat === "antigo" ? " · Retro" : cat === "infantis" ? " · Infantil" : "");

    var story = document.createElement("p");
    story.className = "game-card__story";
    story.textContent = g.story;

    var actions = document.createElement("p");
    actions.className = "game-card__actions";
    var wikiLink = document.createElement("a");
    wikiLink.className = "btn btn--primary btn--sm";
    wikiLink.href = "wiki-jogo.html#" + encodeURIComponent(g.slug);
    wikiLink.textContent = "Guia completo";
    actions.appendChild(wikiLink);

    body.appendChild(h2);
    body.appendChild(meta);
    body.appendChild(story);
    body.appendChild(actions);

    article.appendChild(imgWrap);
    article.appendChild(body);
    return article;
  }

  /**
   * @param {boolean} open
   * @param {HTMLButtonElement} btn
   * @param {HTMLElement} panel
   * @param {string} labelOpen
   * @param {string} labelClosed
   */
  function setSectionOpen(open, btn, panel, labelOpen, labelClosed) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    btn.classList.toggle("lista-section__toggle--open", open);
    var label = btn.querySelector(".lista-section__toggle-label");
    if (label) label.textContent = open ? labelOpen : labelClosed;
  }

  /**
   * Wires a disclosure toggle for a section panel.
   * @param {string} buttonId
   * @param {string} panelId
   * @param {string} labelOpen
   * @param {string} labelClosed
   * @param {boolean} startOpen
   */
  function wireToggle(buttonId, panelId, labelOpen, labelClosed, startOpen) {
    var btn = document.getElementById(buttonId);
    var panel = document.getElementById(panelId);
    if (!btn || !panel) return;

    setSectionOpen(startOpen, btn, panel, labelOpen, labelClosed);

    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      setSectionOpen(!isOpen, btn, panel, labelOpen, labelClosed);
    });
  }

  /**
   * @param {HTMLElement} root
   * @param {Array} games
   */
  function renderSection(root, games) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < games.length; i++) frag.appendChild(buildCard(games[i]));
    root.innerHTML = "";
    root.appendChild(frag);
  }

  function render() {
    var rootRoblox = document.getElementById("listaJogosRoblox");
    var rootOutros = document.getElementById("listaJogosOutros");
    var rootAntigo = document.getElementById("listaJogosAntigo");
    var rootInfantis = document.getElementById("listaJogosInfantis");
    var badgeRoblox = document.getElementById("countRobloxBadge");
    var badgeOutros = document.getElementById("countOutrosBadge");
    var badgeAntigo = document.getElementById("countAntigoBadge");
    var badgeInfantis = document.getElementById("countInfantisBadge");
    if (!rootRoblox || !rootOutros || !rootAntigo || !rootInfantis || typeof window.GAMES_DATA === "undefined")
      return;

    var roblox = [];
    var outros = [];
    var antigo = [];
    var infantis = [];
    for (var i = 0; i < window.GAMES_DATA.length; i++) {
      var g = window.GAMES_DATA[i];
      var c = getCategory(g);
      if (c === "roblox") roblox.push(g);
      else if (c === "outros") outros.push(g);
      else if (c === "antigo") antigo.push(g);
      else if (c === "infantis") infantis.push(g);
    }

    if (badgeRoblox) badgeRoblox.textContent = "(" + roblox.length + ")";
    if (badgeOutros) badgeOutros.textContent = "(" + outros.length + ")";
    if (badgeAntigo) badgeAntigo.textContent = "(" + antigo.length + ")";
    if (badgeInfantis) badgeInfantis.textContent = "(" + infantis.length + ")";

    renderSection(rootRoblox, roblox);
    renderSection(rootOutros, outros);
    renderSection(rootAntigo, antigo);
    renderSection(rootInfantis, infantis);

    wireToggle(
      "toggleListaRoblox",
      "listaJogosRoblox",
      "Ocultar jogos do Roblox",
      "Mostrar jogos do Roblox",
      false
    );
    wireToggle(
      "toggleListaOutros",
      "listaJogosOutros",
      "Ocultar outros jogos",
      "Mostrar outros jogos",
      true
    );
    wireToggle(
      "toggleListaAntigo",
      "listaJogosAntigo",
      "Ocultar jogos clássicos",
      "Mostrar jogos clássicos (retro)",
      true
    );
    wireToggle(
      "toggleListaInfantis",
      "listaJogosInfantis",
      "Ocultar jogos infantis",
      "Mostrar jogos infantis",
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
