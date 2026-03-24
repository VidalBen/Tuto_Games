/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games
 * Purpose: Rich, unique guide text + tips + trivia for every catalog game (merged with games-data).
 */
(function (global) {
  "use strict";

  /**
   * @param {string} slug
   * @param {number} salt
   * @returns {number}
   */
  function hashSlug(slug, salt) {
    var h = 0;
    var s = String(slug || "") + ":" + salt;
    for (var i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  /**
   * @template T
   * @param {T[]} arr
   * @param {string} slug
   * @param {number} salt
   * @returns {T}
   */
  function pick(arr, slug, salt) {
    if (!arr.length) return /** @type {T} */ (undefined);
    return arr[hashSlug(slug, salt) % arr.length];
  }

  /**
   * @template T
   * @param {T[]} arr
   * @param {string} slug
   * @param {number} count
   * @returns {T[]}
   */
  function pickManyUnique(arr, slug, count) {
    var out = [];
    var used = {};
    var salt = 0;
    while (out.length < count && out.length < arr.length) {
      var idx = hashSlug(slug, salt) % arr.length;
      salt += 17;
      if (!used[idx]) {
        used[idx] = true;
        out.push(arr[idx]);
      }
    }
    return out;
  }

  /**
   * @param {{ category?: string, roblox?: boolean }} game
   * @returns {"roblox"|"outros"|"antigo"|"infantis"}
   */
  function bucket(game) {
    if (game.category === "antigo" || game.category === "infantis") return game.category;
    if (game.category === "roblox" || game.category === "outros") return game.category;
    return game.roblox ? "roblox" : "outros";
  }

  var TIPS_ROBLOX = [
    "Antes de gastar moeda rara, confira se o próximo patch não rebalanceia itens — wikis costumam avisar.",
    "Fixe um objetivo por sessão (subir de rank, farmar um pet, terminar uma missão) para não dispersar.",
    "Use servidores públicos para aprender rotas e, depois, privados com amigos para treinar sem pressão.",
    "Eventos sazonais costumam trazer itens limitados — vale acompanhar o feed oficial do criador.",
    "Ajuste sensibilidade e campo de visão nas opções antes de sessões longas; conforto evita desgaste.",
    "Em títulos com economia, negocie com calma e confirme trocas antes de aceitar (evite golpes comuns).",
    "Grave trechos curtos da gameplay para revisar erros de movimento ou timing.",
    "Grupos da comunidade no Roblox ou Discord costumam publicar códigos e guias atualizados.",
    "Se o jogo tiver códigos promocionais, prefira fontes oficiais ou wikis curadas pela comunidade.",
    "Reserve pausas: sessões muito longas em mapas grandes aumentam erros de atenção.",
    "Teste o ping e escolha região de servidor mais próxima quando a opção existir.",
    "Leia o tutorial in-game até o fim — muitos sistemas (craft, ranking, pets) só desbloqueiam depois.",
  ];

  var TIPS_AAA = [
    "Se o jogo tiver New Game+, leia o que carrega entre runs — às vezes convém terminar DLCs antes.",
    "Em mundos abertos, marque pontos de interesse no mapa nativo para voltar depois sem spoiler.",
    "Explore o mapa antes de avançar a história principal: recursos e equipamentos extras facilitam chefes.",
    "Balance áudio de música e efeitos para ouvir pistas de combate e diálogos importantes.",
    "Faça backup de saves na nuvem quando disponível; atualizações podem corrigir progressão.",
    "Ajuste dificuldade conforme o objetivo: narrativa focada vs. desafio máximo mudam o ritmo.",
    "Consulte acessibilidade: controles remapeados e legendas melhoram a experiência para todos.",
    "Evite spoilers em fóruns até terminar o arco principal — muitos têm reviravoltas centrais.",
    "Modo foto / pausa é útil para estudar cenários e encontrar atalhos escondidos.",
    "DLCs e edições completas podem incluir itens — compare antes de comprar pacotes avulsos.",
  ];

  var TIPS_RETRO = [
    "Salve sempre que o jogo permitir; títulos antigos raramente têm autosave generoso.",
    "Controles originais podem ser duros — adapte mapeamento em emuladores ou remasters.",
    "Contexto histórico ajuda: pesquise o ano de lançamento para entender limitações técnicas da época.",
    "Guias modernos e speedruns podem ensinar truques, mas experimente jogar sem pressa na primeira vez.",
  ];

  var TIPS_INFANTIS = [
    "Jogue junto no mesmo sofá: um adulto pode ler textos e a criança comanda ações simples.",
    "Ative legendas e reduza volume de efeitos se algum som incomodar.",
    "Sessões curtas (20–30 min) costumam manter o foco e o humor em dia.",
    "Explorem juntos um objetivo por vez: abrir um mapa novo, vencer um chefe fácil, coletar um item.",
    "Celebrem pequenas vitórias — progressão gentil é o ponto forte desses títulos.",
  ];

  var TRIVIA = [
    "Muitos fãs documentam easter eggs e referências cruzadas na wiki da comunidade.",
    "Speedrunners publicam rotas otimizadas, mas a primeira jogada ganha com exploração sem pressa.",
    "Trilhas sonoras destes títulos costumam aparecer em playlists retro e shows de jogos.",
    "Remasters e ports modernos podem incluir filtros, widescreen e troféis — verifique a edição.",
    "O nome exato do jogo varia por região — na wiki costuma haver redirecionamentos úteis.",
  ];

  /**
   * @param {{ name: string, year: number, type: string, platforms: string, story: string }} game
   * @param {string} slug
   * @returns {string[]}
   */
  function buildAbout(game, slug) {
    var b = bucket(game);
    var paras = [];
    paras.push(game.story);

    var p2 =
      "Em " +
      game.year +
      ", " +
      game.name +
      " consolidou presença em " +
      game.platforms +
      " como experiência de " +
      game.type +
      ".";
    if (b === "roblox") {
      p2 +=
        " No ecossistema Roblox, títulos como este costumam receber atualizações do criador, eventos comunitários e conteúdo gerado por fãs — a longevidade depende muito do engajamento da comunidade.";
    } else if (b === "antigo") {
      p2 +=
        " Como título de referência de sua geração, ele influenciou mecânicas e expectativas que ainda aparecem em jogos atuais — jogá-lo hoje é também um passeio pela história do medium.";
    } else if (b === "infantis") {
      p2 +=
        " O tom costuma ser acessível a várias idades, com opções de ajuda e coop local ou online quando disponível — ideal para introduzir novos jogadores sem frustração excessiva.";
    } else {
      p2 +=
        " A proposta mistura narrativa, desafio e recompensa em ritmo típico de grandes lançamentos — vale ajustar dificuldade e acessibilidade para combinar com seu objetivo (história, 100% ou competitivo).";
    }
    paras.push(p2);

    var p3 =
      pick(
        [
          "Quem busca aprofundar encontra na wiki Fandom listas de itens, missões e atualizações mantidas pela comunidade — o botão no final desta página abre o hub diretamente.",
          "Para comparar build, rotas e tier lists, a documentação colaborativa costuma ser mais atual que guias estáticos impressos — use filtros e histórico de edições quando precisar de dados recentes.",
          "Se você está começando agora, reserve uma primeira sessão só para aprender menus, inventário e loop principal; isso evita confusão nas horas seguintes.",
        ],
        slug,
        2
      ) || "";
    paras.push(p3);

    var p4 =
      "Este guia do Tuto Games resume contexto e boas práticas; detalhes técnicos profundos (patch notes, tabelas completas) continuam centralizados na wiki da comunidade, sempre sujeita às regras dos editores voluntários.";
    paras.push(p4);

    var p5 = pick(
      [
        "Leia comentários recentes em fóruns e na página do jogo para saber o estado do servidor, filas e bugs conhecidos antes de comprar DLC.",
        "Se o título tiver modo campanha e multijogador, decida qual focar primeiro — misturar cedo demais pode dispersar progressão.",
        "Capturas de tela do mapa e do journal in-game ajudam a lembrar onde parou entre sessões.",
        "Em jogos com crafting, anote receitas importantes num bloco de notas — economiza tempo de busca.",
      ],
      slug,
      5
    );
    if (p5) paras.push(p5);

    return paras;
  }

  /**
   * @param {{ name: string, platforms: string }} game
   * @param {string} slug
   * @returns {string[]}
   */
  function buildTips(game, slug) {
    var b = bucket(game);
    var pool =
      b === "roblox"
        ? TIPS_ROBLOX
        : b === "antigo"
          ? TIPS_RETRO.concat(TIPS_AAA)
          : b === "infantis"
            ? TIPS_INFANTIS.concat(TIPS_AAA)
            : TIPS_AAA.concat(TIPS_ROBLOX.slice(0, 6));

    var tips = pickManyUnique(pool, slug, 6);
    tips[0] =
      "Em " +
      game.name +
      ", priorize entender o loop principal (" +
      pick(["combate", "exploração", "progressão", "cooperação"], slug, 11) +
      ") antes de otimizar builds avançadas.";
    return tips;
  }

  /**
   * @param {string} slug
   * @returns {string[]}
   */
  function buildTrivia(slug) {
    return pickManyUnique(TRIVIA, slug, 3);
  }

  /**
   * @param {{ name: string, platforms: string, wikiUrl: string }} game
   * @returns {string}
   */
  function buildWhere(game) {
    return (
      "Para jogar " +
      game.name +
      ", utilize as plataformas indicadas (" +
      game.platforms +
      "). Compre ou baixe apenas em lojas oficiais ou plataformas digitais confiáveis; evite anúncios suspeitos de “código grátis”. Verifique classificação indicativa e requisitos de sistema na página do jogo. O link da wiki da comunidade (Fandom) ao final desta página ajuda a confirmar edições, DLCs e compatibilidade por região."
    );
  }

  /**
   * @param {{ imageUrl: string }} game
   * @returns {string[]}
   */
  function buildGallery(game) {
    return [game.imageUrl];
  }

  /**
   * @param {*} game
   * @returns {{ tagline: string, about: string[], tips: string[], trivia: string[], where: string, gallery: string[] }}
   */
  function getExpandedGuide(game) {
    var slug = game.slug;
    var tagline =
      game.year +
      " · " +
      game.type +
      " · " +
      pick(
        [
          "Guia resumido com imagens e seções organizadas.",
          "Visão geral, dicas e curiosidades — depois aprofunde na wiki.",
          "Informações para começar com o pé direito.",
        ],
        slug,
        99
      );

    return {
      tagline: tagline,
      about: buildAbout(game, slug),
      tips: buildTips(game, slug),
      trivia: buildTrivia(slug),
      where: buildWhere(game),
      gallery: buildGallery(game),
    };
  }

  global.getExpandedGuide = getExpandedGuide;
})(typeof window !== "undefined" ? window : globalThis);
