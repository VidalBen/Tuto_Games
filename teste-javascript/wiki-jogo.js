/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games
 * Purpose: Full game guide page — sections by category, infantil «para pais», Bomb Blast launcher (infantis only).
 */

(function () {
  "use strict";

  /**
   * CSS classes applied to `#conteudo` for category-specific accents.
   * @type {string[]}
   */
  var WIKI_CAT_CLASSES = [
    "wiki-guide-page--cat-roblox",
    "wiki-guide-page--cat-outros",
    "wiki-guide-page--cat-antigo",
    "wiki-guide-page--cat-infantis",
  ];

  /**
   * Resolves list/wiki bucket for styling (Roblox vs outros when `category` absent).
   * @param {*} game
   * @returns {"roblox"|"outros"|"antigo"|"infantis"}
   */
  function getCategoryBucket(game) {
    if (game.category) return game.category;
    return game.roblox ? "roblox" : "outros";
  }

  /**
   * Kids-only themed background images (simple, low-detail) for guide page.
   * @type {Record<string, string>}
   */
  var INFANTIS_BACKGROUND = {
    "kirby-forgotten-land":
      "https://upload.wikimedia.org/wikipedia/en/6/6c/Kirby_and_the_Forgotten_Land.jpg",
    "lego-star-wars-skywalker":
      "https://cdn.cloudflare.steamstatic.com/steam/apps/920210/capsule_616x353.jpg",
    "mario-kart-8-deluxe":
      "https://upload.wikimedia.org/wikipedia/en/b/b5/MarioKart8Boxart.jpg",
    "just-dance-2024":
      "https://upload.wikimedia.org/wikipedia/en/a/a5/Just_Dance_2024_Edition.jpeg",
    "spongebob-bfbb-rehydrated":
      "https://cdn.cloudflare.steamstatic.com/steam/apps/969990/capsule_616x353.jpg",
    "littlebigplanet-3":
      "https://upload.wikimedia.org/wikipedia/en/b/be/LittleBigPlanet_3_boxart.jpg",
    "super-mario-party":
      "https://upload.wikimedia.org/wikipedia/en/6/6c/Super_Mario_Party.jpg",
    "pokemon-lets-go":
      "https://upload.wikimedia.org/wikipedia/en/4/47/Pok%C3%A9mon_Let%27s_Go%2C_Pikachu%21_and_Let%27s_Go%2C_Eevee%21.jpg",
    "minecraft-dungeons":
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/capsule_616x353.jpg",
    "disney-dreamlight-valley":
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1401590/capsule_616x353.jpg",
  };

  /**
   * @returns {string}
   */
  function getSlugFromHash() {
    var h = window.location.hash.replace(/^#/, "");
    try {
      return decodeURIComponent(h);
    } catch (e) {
      return h;
    }
  }

  /**
   * @param {HTMLElement} parent
   * @param {string} tag
   * @param {string|null} className
   * @param {string} text
   * @returns {HTMLElement}
   */
  function el(parent, tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== null && text !== "") n.textContent = text;
    parent.appendChild(n);
    return n;
  }

  /**
   * @param {HTMLElement} container
   * @param {string} gameName
   */
  function renderBreadcrumb(container, gameName) {
    var nav = el(container, "nav", null, "");
    nav.setAttribute("aria-label", "Navegação estrutural");
    var ol = el(nav, "ol", "wiki-guide__breadcrumb", "");

    var li1 = document.createElement("li");
    var a1 = document.createElement("a");
    a1.href = "../index.html";
    a1.textContent = "Início";
    li1.appendChild(a1);
    ol.appendChild(li1);

    var sep1 = document.createElement("li");
    sep1.setAttribute("aria-hidden", "true");
    sep1.textContent = "/";
    ol.appendChild(sep1);

    var li2 = document.createElement("li");
    var a2 = document.createElement("a");
    a2.href = "lista-jogos.html";
    a2.textContent = "Lista completa";
    li2.appendChild(a2);
    ol.appendChild(li2);

    var sep2 = document.createElement("li");
    sep2.setAttribute("aria-hidden", "true");
    sep2.textContent = "/";
    ol.appendChild(sep2);

    var li3 = document.createElement("li");
    var cur = document.createElement("span");
    cur.setAttribute("aria-current", "page");
    cur.textContent = gameName;
    li3.appendChild(cur);
    ol.appendChild(li3);
  }

  /**
   * @param {*} game
   * @param {*} guide
   * @param {"roblox"|"outros"|"antigo"|"infantis"} bucket
   * @returns {HTMLElement}
   */
  function buildArticle(game, guide, bucket) {
    var isInfantis = bucket === "infantis";

    var article = document.createElement("article");
    article.className = "wiki-guide-article";
    article.setAttribute("aria-label", "Guia de " + game.name);

    var hero = el(article, "header", "wiki-guide__hero", "");
    var coverWrap = el(hero, "div", "wiki-guide__cover-wrap", "");
    var img = document.createElement("img");
    img.className = "wiki-guide__cover";
    img.src = game.imageUrl;
    img.alt = "Arte ou capa de " + game.name;
    img.width = 640;
    img.height = 360;
    img.loading = "eager";
    img.decoding = "async";
    img.setAttribute("fetchpriority", "high");
    coverWrap.appendChild(img);

    var heroText = el(hero, "div", "", "");
    el(heroText, "p", "wiki-guide__eyebrow", "Guia Tuto Games");
    el(heroText, "h1", "wiki-guide__title", game.name);
    el(heroText, "p", "wiki-guide__tagline", guide.tagline);

    var chips = el(heroText, "ul", "wiki-guide__chips", "");
    var chipYear = el(chips, "li", "wiki-guide__chip", String(game.year));
    chipYear.setAttribute("title", "Ano de referência");
    var chipPlat = el(chips, "li", "wiki-guide__chip", game.platforms);
    chipPlat.setAttribute("title", "Plataformas");
    var chipType = el(chips, "li", "wiki-guide__chip", game.type);
    chipType.setAttribute("title", "Gênero / estilo");

    var toc = el(article, "nav", "wiki-guide__toc", "");
    toc.setAttribute("aria-label", "Seções do guia");
    var links = [];
    if (isInfantis) {
      links.push(["#wg-pais", "Para pais"]);
    }
    links.push(
      ["#wg-visao", "Visão geral"],
      ["#wg-galeria", "Imagens"],
      ["#wg-dicas", "Dicas"],
      ["#wg-curiosidades", "Curiosidades"],
      ["#wg-onde", "Onde jogar"]
    );
    for (var ti = 0; ti < links.length; ti++) {
      var ta = document.createElement("a");
      ta.href = links[ti][0];
      ta.textContent = links[ti][1];
      toc.appendChild(ta);
    }

    if (isInfantis) {
      var sPais = el(article, "section", "wiki-guide__section wiki-guide__section--pais", "");
      sPais.id = "wg-pais";
      var h2p = el(sPais, "h2", "", "Para pais e responsáveis");
      h2p.id = "wg-pais-title";
      sPais.setAttribute("aria-labelledby", "wg-pais-title");
      var prosePais = el(sPais, "div", "wiki-guide__prose", "");
      el(
        prosePais,
        "p",
        "",
        "Este título é pensado para famílias e crianças. Mesmo assim, vale acompanhar o tempo de tela, ativar controles parentais no console ou PC e conversar sobre compras dentro do jogo quando existirem."
      );
      el(
        prosePais,
        "p",
        "",
        "Confira a classificação indicativa na sua região (por exemplo ESRB ou PEGI) e prefira perfis infantis ou modo família quando a plataforma oferecer."
      );
      el(
        prosePais,
        "p",
        "",
        "Pausa divertida: o botão flutuante com ícone de bomba nesta página abre o minijogo local «Bombas Divertidas» (estilingue e blocos) — disponível só nos guias desta categoria."
      );
    }

    var s1 = el(article, "section", "wiki-guide__section", "");
    s1.id = "wg-visao";
    var h2a = el(s1, "h2", "", "Visão geral");
    h2a.id = "wg-visao-title";
    s1.setAttribute("aria-labelledby", "wg-visao-title");
    var prose = el(s1, "div", "wiki-guide__prose", "");
    for (var p = 0; p < guide.about.length; p++) {
      el(prose, "p", "", guide.about[p]);
    }

    var sGallery = el(article, "section", "wiki-guide__section", "");
    sGallery.id = "wg-galeria";
    var h2g = el(sGallery, "h2", "", "Imagens");
    h2g.id = "wg-galeria-title";
    sGallery.setAttribute("aria-labelledby", "wg-galeria-title");
    var galWrap = el(sGallery, "div", "wiki-guide__gallery", "");
    for (var g = 0; g < guide.gallery.length; g++) {
      var fig = document.createElement("figure");
      var im = document.createElement("img");
      im.src = guide.gallery[g];
      im.alt = game.name + " — imagem " + (g + 1);
      im.loading = g === 0 ? "eager" : "lazy";
      im.decoding = "async";
      fig.appendChild(im);
      var cap = document.createElement("figcaption");
      cap.textContent = g === 0 ? "Capa / arte principal no catálogo" : "Referência visual adicional";
      fig.appendChild(cap);
      galWrap.appendChild(fig);
    }

    var s2 = el(article, "section", "wiki-guide__section", "");
    s2.id = "wg-dicas";
    var h2b = el(s2, "h2", "", "Dicas práticas");
    h2b.id = "wg-dicas-title";
    s2.setAttribute("aria-labelledby", "wg-dicas-title");
    var ol = el(s2, "ol", "wiki-guide__list", "");
    for (var t = 0; t < guide.tips.length; t++) {
      el(ol, "li", "", guide.tips[t]);
    }

    var s3 = el(article, "section", "wiki-guide__section", "");
    s3.id = "wg-curiosidades";
    var h2c = el(s3, "h2", "", "Curiosidades e comunidade");
    h2c.id = "wg-curiosidades-title";
    s3.setAttribute("aria-labelledby", "wg-curiosidades-title");
    var ul = el(s3, "ul", "wiki-guide__list", "");
    for (var r = 0; r < guide.trivia.length; r++) {
      el(ul, "li", "", guide.trivia[r]);
    }

    var s4 = el(article, "section", "wiki-guide__section", "");
    s4.id = "wg-onde";
    var h2d = el(s4, "h2", "", "Onde jogar e compra segura");
    h2d.id = "wg-onde-title";
    s4.setAttribute("aria-labelledby", "wg-onde-title");
    var prose2 = el(s4, "div", "wiki-guide__prose", "");
    el(prose2, "p", "", guide.where);

    var actions = el(article, "div", "wiki-guide__actions", "");
    var ext = document.createElement("a");
    ext.className = "btn btn--primary";
    ext.href = game.wikiUrl;
    ext.target = "_blank";
    ext.rel = "noopener noreferrer";
    ext.textContent = "Abrir wiki da comunidade (Fandom)";
    actions.appendChild(ext);
    var back = document.createElement("a");
    back.className = "btn btn--ghost";
    back.href = "lista-jogos.html";
    back.textContent = "Voltar à lista completa";
    actions.appendChild(back);
    var home = document.createElement("a");
    home.className = "btn btn--ghost";
    home.href = "../index.html";
    home.textContent = "Início";
    actions.appendChild(home);

    var noteText = isInfantis
      ? "O Tetris do Tuto Games continua só na página inicial (botão flutuante). «Bombas Divertidas» abre pelo botão de bomba nesta guia — exclusivo da categoria infantil/família."
      : "O minigame Tetris do Tuto Games continua disponível só pela página inicial (botão flutuante), separado deste guia.";
    el(article, "p", "wiki-guide__note", noteText);

    return article;
  }

  function render() {
    var missingEl = document.getElementById("wikiGuideMissing");
    var rootEl = document.getElementById("wikiGuideRoot");
    var pageEl = document.getElementById("conteudo");

    if (!rootEl || typeof window.findGameBySlug !== "function" || typeof window.getExpandedGuide !== "function") {
      return;
    }

    var slug = getSlugFromHash();
    var game = window.findGameBySlug(slug);

    var bombLaunch = document.getElementById("wikiBombLaunch");

    if (!game) {
      if (missingEl) missingEl.hidden = false;
      rootEl.innerHTML = "";
      document.title = "Jogo não encontrado — Tuto Games";
      if (pageEl) {
        pageEl.classList.remove("wiki-guide-page--infantis");
        for (var ci = 0; ci < WIKI_CAT_CLASSES.length; ci++) {
          pageEl.classList.remove(WIKI_CAT_CLASSES[ci]);
        }
        pageEl.style.backgroundImage = "";
        pageEl.style.backgroundSize = "";
        pageEl.style.backgroundPosition = "";
        pageEl.style.backgroundAttachment = "";
      }
      if (bombLaunch) {
        bombLaunch.hidden = true;
        bombLaunch.onclick = null;
      }
      return;
    }

    if (missingEl) missingEl.hidden = true;
    rootEl.innerHTML = "";

    var bucket = getCategoryBucket(game);

    if (pageEl) {
      for (var cj = 0; cj < WIKI_CAT_CLASSES.length; cj++) {
        pageEl.classList.remove(WIKI_CAT_CLASSES[cj]);
      }
      pageEl.classList.add("wiki-guide-page--cat-" + bucket);

      var bg = bucket === "infantis" ? INFANTIS_BACKGROUND[game.slug] : "";
      if (bg) {
        pageEl.classList.add("wiki-guide-page--infantis");
        pageEl.style.backgroundImage =
          "linear-gradient(180deg, rgba(255,255,255,.82) 0%, rgba(255,247,237,.88) 48%, rgba(253,244,255,.9) 100%), url(\"" +
          bg +
          "\")";
        pageEl.style.backgroundSize = "cover";
        pageEl.style.backgroundPosition = "center top";
        pageEl.style.backgroundAttachment = "fixed";
      } else {
        pageEl.classList.remove("wiki-guide-page--infantis");
        pageEl.style.backgroundImage = "";
        pageEl.style.backgroundSize = "";
        pageEl.style.backgroundPosition = "";
        pageEl.style.backgroundAttachment = "";
      }
    }

    if (bombLaunch) {
      if (bucket === "infantis") {
        bombLaunch.hidden = false;
        bombLaunch.onclick = function () {
          try {
            sessionStorage.setItem("tutoBombAccess", "1");
          } catch (e) {
            /* ignore */
          }
        };
      } else {
        bombLaunch.hidden = true;
        bombLaunch.onclick = null;
      }
    }

    var guide = window.getExpandedGuide(game);
    document.title = game.name + " — Guia | Tuto Games";

    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Guia Tuto Games: " +
          game.name +
          " — visão geral, dicas, imagens e link para a wiki Fandom."
      );
    }

    renderBreadcrumb(rootEl, game.name);
    rootEl.appendChild(buildArticle(game, guide, bucket));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

  window.addEventListener("hashchange", render);
})();
