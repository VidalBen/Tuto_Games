/**
 * Author: Fabiel Santos
 * Date: 2026-03-23
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games home
 * Purpose: Render the first 20 games in the sidebar; each links to the wiki bridge page.
 */

(function () {
  "use strict";

  /** @type {string} Relative path from repo root index.html to HTML pages folder. */
  var TUTO_PAGES_PREFIX = "teste-index.html/";

  var HOME_LIST_LIMIT = 20;

  /**
   * Builds list items for the home sidebar.
   * @param {HTMLElement|null} root
   */
  function renderHomeGameList(root) {
    if (!root || typeof window.GAMES_DATA === "undefined") return;
    var data = window.GAMES_DATA;
    var frag = document.createDocumentFragment();
    var n = Math.min(HOME_LIST_LIMIT, data.length);
    for (var i = 0; i < n; i++) {
      var g = data[i];
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = TUTO_PAGES_PREFIX + "wiki-jogo.html#" + encodeURIComponent(g.slug);
      a.textContent = g.name;
      li.appendChild(a);
      frag.appendChild(li);
    }
    root.innerHTML = "";
    root.appendChild(frag);
  }

  function init() {
    renderHomeGameList(document.getElementById("homeGamesList"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
