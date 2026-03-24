/**
 * Author: Fabiel Santos
 * Date: 2026-03-23
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games global game search
 * Purpose: Typeahead search over GAMES_DATA; navigate to wiki-jogo.html#slug.
 */
(function () {
  "use strict";

  var MAX_RESULTS = 10;

  /**
   * Wiki bridge page path: same folder when already under teste-index.html/; from repo root needs prefix.
   * @returns {string}
   */
  function wikiPagePath() {
    var p = typeof window !== "undefined" && window.location && window.location.pathname
      ? window.location.pathname
      : "";
    if (p.indexOf("teste-index.html") !== -1) {
      return "wiki-jogo.html";
    }
    return "teste-index.html/wiki-jogo.html";
  }

  /**
   * @param {string} s
   * @returns {string}
   */
  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  /**
   * @param {{ name: string, slug: string, type?: string }} g
   * @param {string} q
   * @returns {number} lower is better; -1 = no match
   */
  function scoreMatch(g, q) {
    if (!q) return -1;
    var name = normalize(g.name);
    var slug = normalize(g.slug);
    var typeStr = normalize(g.type || "");
    if (name.indexOf(q) === 0) return 0;
    if (slug.indexOf(q) === 0) return 1;
    if (name.indexOf(q) !== -1) return 2;
    if (slug.indexOf(q) !== -1) return 3;
    var parts = q.split(/\s+/).filter(Boolean);
    if (parts.length > 1 && parts.every(function (p) { return name.indexOf(p) !== -1; })) return 4;
    if (typeStr.indexOf(q) !== -1) return 5;
    return -1;
  }

  /**
   * @param {Array} games
   * @param {string} q
   * @returns {{ g: object, sc: number }[]}
   */
  function filterAndSort(games, q) {
    var scored = [];
    for (var i = 0; i < games.length; i++) {
      var sc = scoreMatch(games[i], q);
      if (sc >= 0) scored.push({ g: games[i], sc: sc });
    }
    scored.sort(function (a, b) {
      if (a.sc !== b.sc) return a.sc - b.sc;
      return a.g.name.localeCompare(b.g.name, "pt-BR");
    });
    return scored;
  }

  function init() {
    var input = document.getElementById("siteSearchInput");
    var list = document.getElementById("siteSearchList");
    var wrap = document.getElementById("siteSearchRoot");
    if (!input || !list || typeof window.GAMES_DATA === "undefined") return;

    var games = window.GAMES_DATA;
    var activeIndex = -1;

    /**
     * @returns {HTMLAnchorElement[]}
     */
    function getLinks() {
      return Array.prototype.slice.call(list.querySelectorAll("a.site-search__hit"));
    }

    function closeList() {
      list.innerHTML = "";
      list.hidden = true;
      activeIndex = -1;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }

    /**
     * @param {number} i
     */
    function setActive(i) {
      var links = getLinks();
      if (!links.length) return;
      var idx = Math.max(0, Math.min(i, links.length - 1));
      links.forEach(function (a, j) {
        var on = j === idx;
        a.classList.toggle("site-search__hit--active", on);
        a.setAttribute("aria-selected", on ? "true" : "false");
      });
      activeIndex = idx;
      if (links[idx]) input.setAttribute("aria-activedescendant", links[idx].id);
    }

    /**
     * @param {string} raw
     */
    function render(raw) {
      var q = normalize(raw);
      list.innerHTML = "";
      if (!q) {
        closeList();
        return;
      }

      var scored = filterAndSort(games, q);
      var n = Math.min(MAX_RESULTS, scored.length);

      if (n === 0) {
        var li0 = document.createElement("li");
        li0.className = "site-search__empty";
        li0.setAttribute("role", "presentation");
        li0.textContent = "Nenhum jogo encontrado.";
        list.appendChild(li0);
        list.hidden = false;
        input.setAttribute("aria-expanded", "true");
        return;
      }

      for (var j = 0; j < n; j++) {
        var g = scored[j].g;
        var li = document.createElement("li");
        li.setAttribute("role", "none");
        var a = document.createElement("a");
        a.className = "site-search__hit";
        a.href = wikiPagePath() + "#" + encodeURIComponent(g.slug);
        a.setAttribute("role", "option");
        a.setAttribute("aria-selected", "false");
        a.id = "siteSearchOpt" + j;
        a.textContent = g.name;
        a.addEventListener("mousedown", function (e) {
          e.preventDefault();
        });
        li.appendChild(a);
        list.appendChild(li);
      }
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      setActive(0);
    }

    input.addEventListener("input", function () {
      render(input.value);
    });

    input.addEventListener("keydown", function (e) {
      var links = getLinks();
      var open = !list.hidden && links.length > 0;

      if (e.key === "Escape") {
        closeList();
        return;
      }

      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActive(activeIndex + 1);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActive(activeIndex - 1);
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          var idx = activeIndex >= 0 ? activeIndex : 0;
          if (links[idx]) window.location.href = links[idx].href;
          return;
        }
      }

      if (e.key === "Enter" && !open && input.value.trim()) {
        e.preventDefault();
        render(input.value);
        var after = getLinks();
        if (after.length === 1) {
          window.location.href = after[0].href;
        }
      }
    });

    document.addEventListener("click", function (e) {
      if (wrap && !wrap.contains(/** @type {Node} */ (e.target))) {
        closeList();
      }
    });

    input.addEventListener("focus", function () {
      if (input.value.trim()) render(input.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
