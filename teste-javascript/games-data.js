/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games catalog
 * Purpose: Single source of game metadata, wiki URLs, and copy for list/wiki pages (incl. category antigo/infantis).
 */

(function (global) {
  "use strict";

  /**
   * @typedef {Object} GameEntry
   * @property {string} slug
   * @property {string} name
   * @property {string} wikiUrl
   * @property {number} year
   * @property {string} type
   * @property {string} platforms
   * @property {string} story
   * @property {string} imageUrl
   * @property {boolean} roblox
   * @property {("roblox"|"outros"|"antigo"|"infantis")=} category Optional; when set, overrides default bucket (Roblox vs outros) on the full list page.
   */

  /** @type {GameEntry[]} */
  var GAMES_DATA = [
    {
      slug: "blox-fruits",
      name: "Blox Fruits",
      wikiUrl: "https://blox-fruits.fandom.com/wiki/Blox_Fruits",
      year: 2019,
      type: "Ação / RPG (Roblox)",
      platforms: "Roblox",
      story:
        "Você navega entre ilhas, enfrenta chefes e coleta frutas lendárias para desbloquear poderes únicos. A progressão mistura farm, PvP e exploração num mundo inspirado em aventuras de piratas.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-a64f70da20fc1e80ee76fe5d49c1be0a/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "adopt-me",
      name: "Adopt Me!",
      wikiUrl: "https://adoptme.fandom.com/wiki/Adopt_Me!",
      year: 2017,
      type: "Simulação social (Roblox)",
      platforms: "Roblox",
      story:
        "Cuide de pets, troque itens e personalize uma casa com amigos. O foco é coleção, eventos sazonais e economia entre jogadores num ambiente familiar e colaborativo.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-3107e01be1912da55cb67b996f8aa1ed/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "brookhaven",
      name: "Brookhaven RP",
      wikiUrl: "https://roblox-brookhaven.fandom.com/wiki/Brookhaven_RP",
      year: 2020,
      type: "Roleplay / cidade aberta (Roblox)",
      platforms: "Roblox",
      story:
        "Viva histórias no subúrbio: escolha profissões, dirija veículos e construa narrativas com outros jogadores. Liberdade total para interpretar personagens no dia a dia da cidade.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-5b1e49671673c8efee1cc4820f5dca36/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "tower-of-hell",
      name: "Tower of Hell",
      wikiUrl: "https://tower-of-hell.fandom.com/wiki/Tower_of_Hell",
      year: 2018,
      type: "Plataforma / desafio (Roblox)",
      platforms: "Roblox",
      story:
        "Suba torres proceduralmente geradas cheias de obstáculos punidores. Cada tentativa exige precisão e memória muscular — um clássico de speedrun e frustração divertida.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-659609f494ea412d5ec9087435e820da/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "doors",
      name: "Doors",
      wikiUrl: "https://doors-game.fandom.com/wiki/DOORS",
      year: 2022,
      type: "Terror / roguelike (Roblox)",
      platforms: "Roblox",
      story:
        "Explore um hotel sombrio porta após porta. Cada sala esconde entidades únicas e regras que você precisa aprender à força — sobrevivência e coop são a chave.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-463da8865fd237fd47484bbe0b9382e5/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "royale-high",
      name: "Royale High",
      wikiUrl: "https://royale-high.fandom.com/wiki/Royale_High",
      year: 2017,
      type: "Fantasia / escola (Roblox)",
      platforms: "Roblox",
      story:
        "Frequentar aulas mágicas, participar de temporadas e vestir looks elaborados define a experiência. É um mix de roleplay leve, moda e eventos narrativos.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-b6535ea52c862505aeed7e3049cb9b75/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "mm2",
      name: "Murder Mystery 2",
      wikiUrl: "https://murder-mystery-2.fandom.com/wiki/Murder_Mystery_2",
      year: 2014,
      type: "Multijogador social (Roblox)",
      platforms: "Roblox",
      story:
        "Um assassino, um xerife e inocentes em um mapa fechado. Deduzir papéis e usar armas cosméticas virou fenômeno — simples de entender, difícil de dominar.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-7fc1713c02b50d12c51b78b59f2a4b15/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "pet-simulator-x",
      name: "Pet Simulator X",
      wikiUrl: "https://pet-simulator-x.fandom.com/wiki/Pet_Simulator_X",
      year: 2021,
      type: "Coleta / idle (Roblox)",
      platforms: "Roblox",
      story:
        "Quebre moedas, choca pets raros e troque em hubs movimentados. A progressão numérica extrema e eventos limitados mantêm a comunidade sempre voltando.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-0553034b9a65832dec398a5904e7e38c/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "arsenal",
      name: "Arsenal",
      wikiUrl: "https://roblox-arsenal.fandom.com/wiki/Arsenal",
      year: 2015,
      type: "FPS arcade (Roblox)",
      platforms: "Roblox",
      story:
        "Elimine adversários para trocar de arma até vencer a rodada. Estilo rápido, mapas variados e humor visual fizeram dele um dos shooters mais citados da plataforma.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-2c691f8c1278352cc98e30afef3c3a4e/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "bee-swarm",
      name: "Bee Swarm Simulator",
      wikiUrl: "https://bee-swarm-simulator.fandom.com/wiki/Bee_Swarm_Simulator",
      year: 2018,
      type: "Coleta / simulação (Roblox)",
      platforms: "Roblox",
      story:
        "Crie um enxame de abelhas, polinize campos e desbloqueie máquinas absurdas. Missões longas e números gigantes atraem quem gosta de otimizar rotas de farm.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-9d7481d5f4b40acde9feacd3c3212e9f/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "shindo-life",
      name: "Shindo Life",
      wikiUrl: "https://shindo-life-rell.fandom.com/wiki/Shindo_Life",
      year: 2020,
      type: "RPG / ação (Roblox)",
      platforms: "Roblox",
      story:
        "Treine estilos de luta, invoque espíritos e explore vilas inspiradas em anime. Spins e bloodlines raros viraram obsessão coletiva entre jogadores competitivos.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-01dc66785b24cde3073ce389cfc03804/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "jailbreak",
      name: "Jailbreak",
      wikiUrl: "https://jailbreak.fandom.com/wiki/Jailbreak",
      year: 2017,
      type: "Mundo aberto / cops & robbers (Roblox)",
      platforms: "Roblox",
      story:
        "Escape da prisão ou impeça fugas em um mapa em constante expansão. Veículos, assaltos e atualizações frequentes moldaram o gênero sandbox no Roblox.",
      imageUrl:
        "https://tr.rbxcdn.com/180DAY-ce515c55e025d422bebe9aa78324d352/512/512/Image/Png/noFilter",
      roblox: true,
    },
    {
      slug: "minecraft",
      name: "Minecraft",
      wikiUrl: "https://minecraft.fandom.com/wiki/Minecraft",
      year: 2011,
      type: "Sandbox / sobrevivência",
      platforms: "PC, consoles, mobile",
      story:
        "Blocos, crafting e mundos infinitos definem a jornada. Você minera de dia, se esconde de criaturas à noite e pode transformar o mundo solo ou em servidor multiplayer.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png",
      roblox: false,
    },
    {
      slug: "fortnite",
      name: "Fortnite",
      wikiUrl: "https://fortnite.fandom.com/wiki/Fortnite",
      year: 2017,
      type: "Battle royale / construção",
      platforms: "PC, consoles, mobile",
      story:
        "Cai na ilha, saqueia armas e constrói defesas em segundos. Temporadas narrativas e crossovers gigantes mantêm o battle royale sempre no noticiário pop.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/a/ae/Fortnite_Save_The_World.jpg",
      roblox: false,
    },
    {
      slug: "among-us",
      name: "Among Us",
      wikiUrl: "https://among-us.fandom.com/wiki/Among_Us",
      year: 2018,
      type: "Dedutivo / multijogador",
      platforms: "PC, mobile, consoles",
      story:
        "Tripulantes completam tarefas enquanto impostores sabotam e eliminam. Discussões rápidas em texto ou voz decidem quem é expulso da nave — paranoia garantida.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg",
      roblox: false,
    },
    {
      slug: "gta-v",
      name: "Grand Theft Auto V",
      wikiUrl: "https://gta.fandom.com/wiki/Grand_Theft_Auto_V",
      year: 2013,
      type: "Ação / mundo aberto",
      platforms: "PC, consoles",
      story:
        "Los Santos mistura sátira, crime e três protagonistas em campanha cinematográfica. Online virou universo próprio com negócios, assaltos e eventos ao vivo.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png",
      roblox: false,
    },
    {
      slug: "zelda-totk",
      name: "The Legend of Zelda: Tears of the Kingdom",
      wikiUrl: "https://zelda.fandom.com/wiki/The_Legend_of_Zelda:_Tears_of_the_Kingdom",
      year: 2023,
      type: "Aventura / ação",
      platforms: "Nintendo Switch",
      story:
        "Hyrule ganha ilhas no céu e abismos subterrâneos. Ultrahand e Zonai devices permitem construir veículos e armas improvisadas — pura engenhosidade de exploração.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/en/f/fb/The_Legend_of_Zelda_Tears_of_the_Kingdom_cover.jpg",
      roblox: false,
    },
    {
      slug: "elden-ring",
      name: "Elden Ring",
      wikiUrl: "https://eldenring.fandom.com/wiki/Elden_Ring",
      year: 2022,
      type: "RPG de ação / soulslike",
      platforms: "PC, consoles",
      story:
        "As Terras Intermediárias escondem chefes brutais e lore fragmentada. Você escolhe o próprio caminho, monta builds criativas e descobre segredos colaborando com a comunidade.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg",
      roblox: false,
    },
    {
      slug: "valorant",
      name: "Valorant",
      wikiUrl: "https://valorant.fandom.com/wiki/Valorant",
      year: 2020,
      type: "FPS tático 5v5",
      platforms: "PC, consoles",
      story:
        "Agentes com habilidades únicas disputam bomb sites em rodadas curtas. Precisão, comunicação e economia de créditos definem quem fecha o mapa.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.svg/330px-Valorant_logo_-_pink_color_version.svg.png",
      roblox: false,
    },
    {
      slug: "league-of-legends",
      name: "League of Legends",
      wikiUrl: "https://leagueoflegends.fandom.com/wiki/League_of_Legends",
      year: 2009,
      type: "MOBA",
      platforms: "PC",
      story:
        "Duas equipes destruíem o Nexus em rotas simétricas. Campeões com kits profundos e meta sempre mutável fazem cada partida ser um xadrez em tempo real.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/League_of_Legends_2019_vector.svg/330px-League_of_Legends_2019_vector.svg.png",
      roblox: false,
    },
    {
      slug: "pokemon-sv",
      name: "Pokémon Scarlet e Violet",
      wikiUrl: "https://pokemon.fandom.com/wiki/Pok%C3%A9mon_Scarlet_and_Violet",
      year: 2022,
      type: "RPG de captura",
      platforms: "Nintendo Switch",
      story:
        "Paldea abre mundo contínuo para estudantes rivais e Terastalização. Missões de liga, Team Star e lendários compõem uma jornada escolar cheia de descobertas.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/en/thumb/0/00/Pok%C3%A9mon_Scarlet_and_Violet_banner.png/330px-Pok%C3%A9mon_Scarlet_and_Violet_banner.png",
      roblox: false,
    },
    {
      slug: "mario-odyssey",
      name: "Super Mario Odyssey",
      wikiUrl: "https://mario.fandom.com/wiki/Super_Mario_Odyssey",
      year: 2017,
      type: "Plataforma 3D",
      platforms: "Nintendo Switch",
      story:
        "Mario e Cappy viajam reinos inteiros possuindo inimigos e objetos. Cada reino esconde luas e referências nostálgicas em níveis abertos e criativos.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/8d/Super_Mario_Odyssey.jpg",
      roblox: false,
    },
    {
      slug: "rdr2",
      name: "Red Dead Redemption 2",
      wikiUrl: "https://reddead.fandom.com/wiki/Red_Dead_Redemption_2",
      year: 2018,
      type: "Ação / faroeste",
      platforms: "PC, consoles",
      story:
        "Arthur Morgan navega o fim da era dos fora-da-lei. Caça, honra e traições marcam a gangue Van der Linde num mapa vivo que reage às suas escolhas.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg",
      roblox: false,
    },
    {
      slug: "animal-crossing",
      name: "Animal Crossing: New Horizons",
      wikiUrl: "https://animalcrossing.fandom.com/wiki/Animal_Crossing:_New_Horizons",
      year: 2020,
      type: "Simulação social",
      platforms: "Nintendo Switch",
      story:
        "Você desenvolve uma ilha deserta em paraíso personalizado. Peças de mobiliário, vizinhos fofos e eventos sazonais viraram refúgio relaxante durante a pandemia.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/1/1f/Animal_Crossing_New_Horizons.jpg",
      roblox: false,
    },
    {
      slug: "cyberpunk-2077",
      name: "Cyberpunk 2077",
      wikiUrl: "https://cyberpunk.fandom.com/wiki/Cyberpunk_2077",
      year: 2020,
      type: "RPG de mundo aberto",
      platforms: "PC, consoles",
      story:
        "Night City promete corpo cibernético e fama, mas entrega conspirações corporativas. DLC Phantom Liberty expandiu ramificações políticas e finais ainda mais densos.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
      roblox: false,
    },
    {
      slug: "cod-warzone",
      name: "Call of Duty: Warzone",
      wikiUrl: "https://callofduty.fandom.com/wiki/Call_of_Duty:_Warzone",
      year: 2020,
      type: "Battle royale FPS",
      platforms: "PC, consoles",
      story:
        "Queda de paraquedas, loadouts personalizados e gulag decidem sobrevivência. Integração com títulos anuais da série mantém mapas e armas sempre renovados.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/6/65/COD_Warzone_Cover_Art.jpg",
      roblox: false,
    },
    {
      slug: "fifa-24",
      name: "EA Sports FC 24",
      wikiUrl: "https://fifa.fandom.com/wiki/EA_Sports_FC_24",
      year: 2023,
      type: "Esporte / simulação",
      platforms: "PC, consoles",
      story:
        "O sucessor espiritual de FIFA traz HyperMotion e modos Ultimate Team atualizados. Clubes licenciados e competições online continuam movendo milhões de partidas.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b3/EA_FC24_Cover.jpg",
      roblox: false,
    },
    {
      slug: "witcher-3",
      name: "The Witcher 3: Wild Hunt",
      wikiUrl: "https://witcher.fandom.com/wiki/The_Witcher_3:_Wild_Hunt",
      year: 2015,
      type: "RPG de mundo aberto",
      platforms: "PC, consoles, Switch",
      story:
        "Geralt caça o Profeta em um continente devastado pela guerra. Contratos secundários tão ricos quanto a trilha principal elevaram o padrão narrativo dos RPGs modernos.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg",
      roblox: false,
    },
    {
      slug: "god-of-war-ragnarok",
      name: "God of War Ragnarök",
      wikiUrl: "https://godofwar.fandom.com/wiki/God_of_War_Ragnar%C3%B6k",
      year: 2022,
      type: "Ação / aventura",
      platforms: "PlayStation, PC",
      story:
        "Kratos e Atreus encaram o fim do Fimbulwinter nórdico. Combate visceral e drama familiar se misturam enquanto profecias ameaçam separar pai e filho.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg",
      roblox: false,
    },
    {
      slug: "hollow-knight",
      name: "Hollow Knight",
      wikiUrl: "https://hollowknight.fandom.com/wiki/Hollow_Knight",
      year: 2017,
      type: "Metroidvania",
      platforms: "PC, consoles, Switch",
      story:
        "Hallownest é um reino subterrâneo em ruínas cheio de insetos corrompidos. Exploração não linear, chefes exigentes e lore ambiental conquistaram fãs de jogos indie.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/d/de/Hollow_Knight_2026_cover_art.jpg",
      roblox: false,
    },

    /* Classic / retro (NES, PS2 era, etc.) — category "antigo" */
    {
      slug: "super-mario-bros",
      name: "Super Mario Bros.",
      wikiUrl: "https://mario.fandom.com/wiki/Super_Mario_Bros.",
      year: 1985,
      type: "Plataforma 2D (clássico)",
      platforms: "NES / relançamentos",
      story:
        "O jogo que definiu o salto lateral em mundos coloridos: Mario atravessa o Reino Cogumelo para salvar a Princesa Peach de Bowser — referência absoluta dos 8 bits.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/0/03/Super_Mario_Bros._box.png",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "legend-of-zelda-nes",
      name: "The Legend of Zelda",
      wikiUrl: "https://zelda.fandom.com/wiki/The_Legend_of_Zelda",
      year: 1986,
      type: "Aventura / labirinto (clássico)",
      platforms: "NES / relançamentos",
      story:
        "Link explora Hyrule em perspectiva top-down, coleta espadas e itens e mergulha nas primeiras masmorras da série — pura descoberta para a época.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/en/4/41/Legend_of_zelda_cover_%28with_cartridge%29_gold.png",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "sonic-the-hedgehog",
      name: "Sonic the Hedgehog",
      wikiUrl: "https://sonic.fandom.com/wiki/Sonic_the_Hedgehog_(1991)",
      year: 1991,
      type: "Plataforma veloz (16 bits)",
      platforms: "Mega Drive / compilados",
      story:
        "Sonic desafia o Dr. Robotnik em loops e rampas com física rápida e trilha memorável — o mascote azul que competiu com Mario na era 16 bits.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/ba/Sonic_the_Hedgehog_1_Genesis_box_art.jpg",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "pac-man",
      name: "Pac-Man",
      wikiUrl: "https://pacman.fandom.com/wiki/Pac-Man_(game)",
      year: 1980,
      type: "Labirinto / arcade",
      platforms: "Arcade, consoles, PC",
      story:
        "Coma pontos, fuja dos fantasmas e use power pellets para virar o jogo — um ícone cultural dos fliperamas que ainda influencia design casual.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Pacman.svg/330px-Pacman.svg.png",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "tetris-game-boy",
      name: "Tetris (Game Boy)",
      wikiUrl: "https://tetris.fandom.com/wiki/Tetris_(Game_Boy)",
      year: 1989,
      type: "Puzzle (portátil clássico)",
      platforms: "Game Boy / Nintendo Switch Online",
      story:
        "Peças caem, você encaixa linhas e a música virou trilha de uma geração — o puzzle perfeito para viagens e pausas curtas (capa representativa da série Tetris).",
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1003590/header.jpg",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "final-fantasy-vii",
      name: "Final Fantasy VII",
      wikiUrl: "https://finalfantasy.fandom.com/wiki/Final_Fantasy_VII",
      year: 1997,
      type: "RPG por turnos (PS1)",
      platforms: "PlayStation, PC, remasters",
      story:
        "Cloud e a Avalanche enfrentam a Shinra em Midgar e além — cinemáticas pré-renderizadas e uma trama que elevou o JRPG ao mainstream ocidental.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/c/c2/Final_Fantasy_VII_Box_Art.jpg",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "metal-gear-solid-2",
      name: "Metal Gear Solid 2: Sons of Liberty",
      wikiUrl: "https://metalgear.fandom.com/wiki/Metal_Gear_Solid_2:_Sons_of_Liberty",
      year: 2001,
      type: "Furtivo / ação (PS2)",
      platforms: "PlayStation 2, relançamentos",
      story:
        "Raiden herda uma trama cheia de reviravoltas sobre informação e controle — referência técnica e narrativa da era PS2.",
      imageUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5e1c.jpg",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "kingdom-hearts",
      name: "Kingdom Hearts",
      wikiUrl: "https://kingdomhearts.fandom.com/wiki/Kingdom_Hearts",
      year: 2002,
      type: "RPG de ação / crossover (PS2)",
      platforms: "PlayStation 2, coleções",
      story:
        "Sora, Donald e Pateta atravessam mundos da Disney com Keyblade em mãos — combate em tempo real e nostalgia em dose dupla.",
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2552430/header.jpg",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "shadow-of-the-colossus",
      name: "Shadow of the Colossus",
      wikiUrl: "https://teamico.fandom.com/wiki/Shadow_of_the_Colossus",
      year: 2005,
      type: "Aventura / chefes monumentais (PS2)",
      platforms: "PlayStation 2, remaster",
      story:
        "Wander escala gigantes solitários num mundo vazio e melancólico — poucos jogos PS2 são tão citados por arte e atmosfera.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/en/f/f8/Shadow_of_the_Colossus_%282005%29_cover.jpg",
      roblox: false,
      category: "antigo",
    },
    {
      slug: "gran-turismo-3",
      name: "Gran Turismo 3: A-Spec",
      wikiUrl: "https://gran-turismo.fandom.com/wiki/Gran_Turismo_3:_A-Spec",
      year: 2001,
      type: "Simulação de corrida (PS2)",
      platforms: "PlayStation 2",
      story:
        "Licenças reais, física cuidadosa e modo campanha longo — o título que muitos associam ao auge do realismo de corrida no PS2.",
      imageUrl:
        "https://images.launchbox-app.com/d40efb5f-ffd1-49d2-8b5b-8593794f3587.jpg",
      roblox: false,
      category: "antigo",
    },

    /* Kids-friendly — category "infantis" */
    {
      slug: "kirby-forgotten-land",
      name: "Kirby and the Forgotten Land",
      wikiUrl: "https://kirby.fandom.com/wiki/Kirby_and_the_Forgotten_Land",
      year: 2022,
      type: "Plataforma 3D (infantil / família)",
      platforms: "Nintendo Switch",
      story:
        "Kirby engole inimigos e copia poderes em cenários fofos e acessíveis — coop local e dificuldade gentil para crianças e iniciantes.",
      imageUrl:
        "https://images.launchbox-app.com/e4d0e8ae-aa1c-4acc-8ee8-73ba35cde990.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "lego-star-wars-skywalker",
      name: "LEGO Star Wars: The Skywalker Saga",
      wikiUrl: "https://brickipedia.fandom.com/wiki/LEGO_Star_Wars:_The_Skywalker_Saga",
      year: 2022,
      type: "Aventura LEGO / humor leve",
      platforms: "PC, consoles",
      story:
        "Reviva as três trilogias com quebra de blocos, risadas e modo cooperativo — ideal para famílias e fãs de Star Wars de qualquer idade.",
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/920210/header.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "mario-kart-8-deluxe",
      name: "Mario Kart 8 Deluxe",
      wikiUrl: "https://mario.fandom.com/wiki/Mario_Kart_8_Deluxe",
      year: 2017,
      type: "Kart arcade (família)",
      platforms: "Nintendo Switch",
      story:
        "Pistas coloridas, itens caóticos e modo assistido para quem está aprendendo — um dos kart racers mais jogados em sala de estar.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b5/MarioKart8Boxart.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "just-dance-2024",
      name: "Just Dance 2024 Edition",
      wikiUrl: "https://justdance.fandom.com/wiki/Just_Dance_2024",
      year: 2023,
      type: "Ritmo / dança (todas as idades)",
      platforms: "PC, consoles, Switch",
      story:
        "Siga coreografias com músicas atuais e modo kids — movimento, diversão e tela compartilhada sem violência.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/a/a5/Just_Dance_2024_Edition.jpeg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "spongebob-bfbb-rehydrated",
      name: "SpongeBob SquarePants: Battle for Bikini Bottom – Rehydrated",
      wikiUrl: "https://spongebob.fandom.com/wiki/Battle_for_Bikini_Bottom_-_Rehydrated",
      year: 2020,
      type: "Plataforma / licença infantil",
      platforms: "PC, consoles, Switch",
      story:
        "Bob Esponja e Patrick recuperam Bikini Bottom em fases humoradas — nostalgia dos anos 2000 com visual renovado para novas gerações.",
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/969990/header.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "littlebigplanet-3",
      name: "LittleBigPlanet 3",
      wikiUrl: "https://littlebigplanet.fandom.com/wiki/LittleBigPlanet_3",
      year: 2014,
      type: "Plataforma criativa / coop",
      platforms: "PlayStation 3, PlayStation 4",
      story:
        "Sackboy e novos amigos costuram mundos feitos de tecido e papelão — forte ênfase em criar e compartilhar níveis com a família.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/be/LittleBigPlanet_3_boxart.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "super-mario-party",
      name: "Super Mario Party",
      wikiUrl: "https://mario.fandom.com/wiki/Super_Mario_Party",
      year: 2018,
      type: "Party game / tabuleiro digital",
      platforms: "Nintendo Switch",
      story:
        "Minigames rápidos, tabuleiros temáticos e modo para até quatro jogadores — perfeito para noites em família com regras simples.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/6/6c/Super_Mario_Party.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "pokemon-lets-go",
      name: "Pokémon: Let's Go, Pikachu! e Let's Go, Eevee!",
      wikiUrl: "https://pokemon.fandom.com/wiki/Pok%C3%A9mon:_Let%27s_Go,_Pikachu!_and_Let%27s_Go,_Eevee!",
      year: 2018,
      type: "RPG de captura (acessível)",
      platforms: "Nintendo Switch",
      story:
        "Relembre Kanto com captura estilo GO e batalhas simplificadas — ótima porta de entrada para crianças no universo Pokémon.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/en/4/47/Pok%C3%A9mon_Let%27s_Go%2C_Pikachu%21_and_Let%27s_Go%2C_Eevee%21.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "minecraft-dungeons",
      name: "Minecraft Dungeons",
      wikiUrl: "https://minecraft.fandom.com/wiki/Minecraft_Dungeons",
      year: 2020,
      type: "Hack and slash / coop (livre de violência gráfica)",
      platforms: "PC, consoles, Switch",
      story:
        "Dungeon crawler em blocos com loot, magias e até quatro heróis — ação leve inspirada no universo Minecraft sem construção complexa.",
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg",
      roblox: false,
      category: "infantis",
    },
    {
      slug: "disney-dreamlight-valley",
      name: "Disney Dreamlight Valley",
      wikiUrl: "https://disneydreamlightvalley.fandom.com/wiki/Disney_Dreamlight_Valley",
      year: 2022,
      type: "Simulação / aventura (Disney)",
      platforms: "PC, consoles, Switch",
      story:
        "Restaure o vale ao lado de clássicos Disney e Pixar: pesca, cozinha, decoração e missões calmas — tom familiar e positivo.",
      imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1401590/header.jpg",
      roblox: false,
      category: "infantis",
    },
  ];

  global.GAMES_DATA = GAMES_DATA;

  /**
   * @param {string} slug
   * @returns {GameEntry|undefined}
   */
  global.findGameBySlug = function (slug) {
    if (!slug) return undefined;
    var s = String(slug).toLowerCase();
    for (var i = 0; i < GAMES_DATA.length; i++) {
      if (GAMES_DATA[i].slug === s) return GAMES_DATA[i];
    }
    return undefined;
  };
})(typeof window !== "undefined" ? window : globalThis);
