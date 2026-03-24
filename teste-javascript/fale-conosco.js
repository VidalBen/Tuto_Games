/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games contact hub
 * Purpose: Multi-step site evaluation wizard (Fale conosco), bug reports, public chat on chat-comunidade.html
 * (local + optional Supabase), sticker bar, retention (100 msgs / 30d), clear-all test button, owner forms.
 */

(function () {
  "use strict";

  var STORAGE_CHAT = "tuto_fc_public_chat_v1";
  var STORAGE_REPORTS = "tuto_fc_reports_v1";
  var STORAGE_USERNAME = "tuto_fc_chat_username_v1";
  var MAX_USERNAME = 10;
  var CENSORED_NAME = "########";
  var POLL_MS = 5000;
  /** @type {number} Maximum messages kept in the public chat (oldest dropped first). */
  var MAX_CHAT_MESSAGES = 100;
  /** @type {number} Drop messages older than this many milliseconds (~1 month). */
  var CHAT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

  /**
   * Substrings forbidden in chat usernames and in message bodies (same list). Matched on normalized text.
   * @type {string[]}
   */
  var FORBIDDEN_CHAT_FRAGMENTS = [
    "bucet",
    "caralh",
    "cuzao",
    "cuzão",
    "foda",
    "fode",
    "fodi",
    "puta",
    "puto",
    "pinto",
    "penis",
    "pênis",
    "vagin",
    "bunda",
    "sexo",
    "sexy",
    "porn",
    "nudes",
    "erotic",
    "orgasm",
    "estupr",
    "pedof",
    "incest",
    "cocain",
    "heroin",
    "merda",
    "porra",
    "viado",
    "viad0",
    "fdp",
    "desgra",
    "escrot",
    "nigg",
    "fagg",
    "bitch",
    "shit",
    "fuck",
    "dick",
    "cock",
    "pussy",
    "slut",
    "whore",
    "milf",
    "hentai",
    "blowjob",
    "gozar",
    "goza",
    "punhet",
    "masturb",
    "nazismo",
    "hitler",
    "estupro",
    "cuzinho",
    "buceta",
    "caralho",
    "filhodaputa",
    "fdputa",
  ];

  /**
   * Normalizes text for substring checks (lowercase, strips accents loosely).
   * @param {string} s
   * @returns {string}
   */
  function normalizeForScan(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Returns censored username if it contains forbidden fragments.
   * @param {string} raw
   * @returns {string}
   */
  function sanitizeUsername(raw) {
    var trimmed = String(raw || "").trim().slice(0, MAX_USERNAME);
    if (!trimmed) return CENSORED_NAME;
    var n = normalizeForScan(trimmed);
    var tokens = n.split(/[^a-z0-9]+/).filter(function (t) {
      return t.length > 0;
    });
    for (var i = 0; i < FORBIDDEN_CHAT_FRAGMENTS.length; i++) {
      var frag = normalizeForScan(FORBIDDEN_CHAT_FRAGMENTS[i]);
      if (!frag) continue;
      if (n.indexOf(frag) !== -1) return CENSORED_NAME;
      for (var j = 0; j < tokens.length; j++) {
        if (tokens[j] === frag || (frag.length >= 4 && tokens[j].indexOf(frag) === 0)) {
          return CENSORED_NAME;
        }
      }
    }
    return trimmed;
  }

  /**
   * Replaces offensive substrings in message text with the same placeholder as blocked usernames.
   * @param {string} raw
   * @returns {string}
   */
  function sanitizeMessageBody(raw) {
    var out = String(raw || "");
    var repl = "####";
    var changed = true;
    while (changed) {
      changed = false;
      var nWork = normalizeForScan(out);
      for (var i = 0; i < FORBIDDEN_CHAT_FRAGMENTS.length; i++) {
        var f = normalizeForScan(FORBIDDEN_CHAT_FRAGMENTS[i]);
        if (!f || f.length < 2) continue;
        var pos = nWork.indexOf(f);
        if (pos !== -1) {
          out = out.slice(0, pos) + repl + out.slice(pos + f.length);
          changed = true;
          break;
        }
      }
    }
    return out;
  }

  /**
   * @returns {boolean}
   */
  function useRemoteChat() {
    var u = typeof window.TUTO_SUPABASE_URL === "string" ? window.TUTO_SUPABASE_URL.trim() : "";
    var k = typeof window.TUTO_SUPABASE_ANON_KEY === "string" ? window.TUTO_SUPABASE_ANON_KEY.trim() : "";
    return Boolean(u && k);
  }

  /**
   * @param {string} key
   * @param {*} fallback
   * @returns {*}
   */
  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   */
  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* ignore quota */
    }
  }

  /**
   * Keeps at most MAX_CHAT_MESSAGES newest items and drops entries older than CHAT_MAX_AGE_MS.
   * @param {Array<{id:string,username:string,body:string,ts:number}>} list
   * @returns {Array<{id:string,username:string,body:string,ts:number}>}
   */
  function applyChatRetention(list) {
    var now = Date.now();
    var cutoff = now - CHAT_MAX_AGE_MS;
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (!m || typeof m.ts !== "number") continue;
      if (m.ts < cutoff) continue;
      out.push(m);
    }
    out.sort(function (a, b) {
      return a.ts - b.ts;
    });
    while (out.length > MAX_CHAT_MESSAGES) {
      out.shift();
    }
    return out;
  }

  /**
   * @param {Array<{id:string,username:string,body:string,ts:number}>} a
   * @param {Array<{id:string,username:string,body:string,ts:number}>} b
   * @returns {boolean}
   */
  function sameMessageList(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || a[i].ts !== b[i].ts) return false;
    }
    return true;
  }

  /**
   * @returns {Array<{id:string,username:string,body:string,ts:number}>}
   */
  function loadLocalMessages() {
    var list = readJson(STORAGE_CHAT, []);
    if (!Array.isArray(list)) list = [];
    var pruned = applyChatRetention(list);
    if (!sameMessageList(list, pruned)) {
      saveLocalMessages(pruned);
    }
    return pruned;
  }

  /**
   * @param {Array<{id:string,username:string,body:string,ts:number}>} list
   */
  function saveLocalMessages(list) {
    writeJson(STORAGE_CHAT, list);
    try {
      var bc = new BroadcastChannel("tuto-fc-chat");
      bc.postMessage({ type: "refresh" });
      bc.close();
    } catch (e) {
      /* BroadcastChannel unsupported */
    }
  }

  /**
   * @param {{id:string,username:string,body:string,ts:number}} msg
   */
  function appendLocalMessage(msg) {
    var list = readJson(STORAGE_CHAT, []);
    if (!Array.isArray(list)) list = [];
    list.push(msg);
    list = applyChatRetention(list);
    saveLocalMessages(list);
  }

  /**
   * Clears all public chat messages stored locally (test action).
   */
  function clearAllLocalChatMessages() {
    saveLocalMessages([]);
  }

  /**
   * @returns {Promise<Array<{id:string,username:string,body:string,ts:number}>>}
   */
  async function fetchRemoteMessages() {
    if (!useRemoteChat()) return loadLocalMessages();
    var base = window.TUTO_SUPABASE_URL.replace(/\/$/, "");
    var key = window.TUTO_SUPABASE_ANON_KEY;
    var url =
      base +
      "/rest/v1/public_chat_messages?select=id,username,body,created_at&order=created_at.asc";
    var res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
      },
    });
    if (!res.ok) throw new Error("remote_fetch_failed");
    /** @type {Array<{id:string,username:string,body:string,created_at:string}>} */
    var rows = await res.json();
    var mapped = rows.map(function (r) {
      return {
        id: String(r.id),
        username: sanitizeUsername(String(r.username || "")),
        body: sanitizeMessageBody(String(r.body || "")),
        ts: new Date(r.created_at).getTime() || Date.now(),
      };
    });
    return applyChatRetention(mapped);
  }

  /**
   * @param {string} username
   * @param {string} body
   * @returns {Promise<void>}
   */
  async function sendRemoteMessage(username, body) {
    var base = window.TUTO_SUPABASE_URL.replace(/\/$/, "");
    var key = window.TUTO_SUPABASE_ANON_KEY;
    var res = await fetch(base + "/rest/v1/public_chat_messages", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        username: username,
        body: body,
      }),
    });
    if (!res.ok) throw new Error("remote_send_failed");
  }

  /**
   * Attempts to delete all rows in public_chat_messages (requires RLS DELETE for anon).
   * @returns {Promise<boolean>}
   */
  async function deleteAllRemoteMessages() {
    var base = window.TUTO_SUPABASE_URL.replace(/\/$/, "");
    var key = window.TUTO_SUPABASE_ANON_KEY;
    var res = await fetch(base + "/rest/v1/public_chat_messages?body=not.is.null", {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        Prefer: "return=minimal",
      },
    });
    return res.ok;
  }

  /**
   * Shows a thank-you panel with rich layout for avaliação, bugs e contato dono (#thanks*Msg).
   * @param {string} boxId
   * @param {string} text
   */
  function showThanks(boxId, text) {
    var el = document.getElementById(boxId);
    if (!el) return;
    el.hidden = false;
    el.setAttribute("role", "status");
    var richMsgIds = {
      thanksAvaliacao: "thanksAvaliacaoMsg",
      thanksBugs: "thanksBugsMsg",
      thanksDono: "thanksDonoMsg",
    };
    var msgId = richMsgIds[boxId];
    if (msgId) {
      var msg = document.getElementById(msgId);
      if (msg) msg.textContent = text;
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      } catch (err) {
        /* ignore */
      }
    } else {
      el.textContent = text;
    }
  }

  /**
   * @param {HTMLElement} container
   * @param {Array<{id:string,username:string,body:string,ts:number}>} messages
   * @param {(id:string)=>void} onReport
   */
  function renderChatMessages(container, messages, onReport) {
    container.innerHTML = "";
    if (!messages.length) {
      var empty = document.createElement("p");
      empty.className = "fc-chat__empty";
      empty.textContent = "Nenhuma mensagem ainda — seja o primeiro a dizer oi.";
      container.appendChild(empty);
      return;
    }
    var frag = document.createDocumentFragment();
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var row = document.createElement("article");
      row.className = "fc-chat__msg";
      row.dataset.id = m.id;

      var meta = document.createElement("p");
      meta.className = "fc-chat__msg-meta";
      var d = new Date(m.ts);
      meta.textContent =
        sanitizeUsername(String(m.username || "")) + " · " + d.toLocaleString("pt-BR", { hour12: false });

      var body = document.createElement("p");
      body.className = "fc-chat__msg-body";
      body.textContent = sanitizeMessageBody(String(m.body || ""));

      var actions = document.createElement("p");
      actions.className = "fc-chat__msg-actions";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--ghost btn--sm fc-chat__report";
      btn.textContent = "Denunciar";
      btn.addEventListener("click", function () {
        onReport(m.id);
      });
      actions.appendChild(btn);

      row.appendChild(meta);
      row.appendChild(body);
      row.appendChild(actions);
      frag.appendChild(row);
    }
    container.appendChild(frag);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * @param {string} messageId
   */
  function recordReport(messageId) {
    var list = readJson(STORAGE_REPORTS, []);
    list.push({
      id: "rep_" + Date.now(),
      messageId: messageId,
      ts: Date.now(),
    });
    writeJson(STORAGE_REPORTS, list);
    alert(
      "Denúncia registrada neste navegador. Quando o servidor estiver ativo, enviaremos para a moderação."
    );
  }

  /**
   * Drives the multi-step evaluation UI: slide transform, progress bar, star row fill state.
   */
  function initEvalWizard() {
    var root = document.getElementById("fcEvalRoot");
    if (!root) return;

    var total = 6;
    var step = 0;
    var btnPrev = document.getElementById("fcEvalPrev");
    var btnNext = document.getElementById("fcEvalNext");
    var btnSubmit = document.getElementById("fcEvalSubmit");
    var stepLabel = document.getElementById("fcEvalStepLabel");
    var progressBar = document.getElementById("fcEvalProgress");
    var dotsWrap = document.getElementById("fcEvalDots");
    var slides = root.querySelectorAll(".fc-eval__slide");

    root.setAttribute("data-fc-eval-last-step", String(total - 1));

    /**
     * Syncs `data-rating` on each `.fc-eval-stars` group for filled-star styling.
     */
    function syncStarRows() {
      var groups = root.querySelectorAll(".fc-eval-stars");
      for (var g = 0; g < groups.length; g++) {
        var group = groups[g];
        var c = group.querySelector("input:checked");
        group.setAttribute("data-rating", c ? c.value : "0");
      }
    }

    /**
     * @param {number} n Step index (0 .. total - 1).
     */
    function setStep(n) {
      step = Math.max(0, Math.min(total - 1, n));
      root.style.setProperty("--fc-eval-step", String(step));
      if (btnPrev) btnPrev.disabled = step === 0;
      if (btnNext) btnNext.hidden = step === total - 1;
      if (btnSubmit) {
        btnSubmit.hidden = step !== total - 1;
        btnSubmit.disabled = step !== total - 1;
      }
      if (stepLabel) stepLabel.textContent = "Passo " + (step + 1) + " de " + total;
      if (progressBar) progressBar.setAttribute("aria-valuenow", String(step + 1));
      var fill = root.querySelector(".fc-eval__progress-fill");
      if (fill) fill.style.width = ((step + 1) / total) * 100 + "%";
      if (dotsWrap) {
        var dots = dotsWrap.querySelectorAll(".fc-eval__dot");
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.toggle("is-active", i === step);
        }
      }
      for (var s = 0; s < slides.length; s++) {
        slides[s].setAttribute("aria-hidden", s === step ? "false" : "true");
      }
    }

    function goNext() {
      if (step === 1) {
        var nota = root.querySelector('input[name="nota"]:checked');
        if (!nota) {
          alert("Escolha uma nota geral (estrelas) antes de continuar.");
          return;
        }
      }
      setStep(step + 1);
    }

    function goPrev() {
      setStep(step - 1);
    }

    if (btnPrev) btnPrev.addEventListener("click", goPrev);
    if (btnNext) btnNext.addEventListener("click", goNext);

    var groups = root.querySelectorAll(".fc-eval-stars");
    for (var j = 0; j < groups.length; j++) {
      groups[j].addEventListener("change", syncStarRows);
    }
    syncStarRows();
    root._fcEvalSetStep = setStep;
    setStep(0);
  }

  /**
   * Demo submit handler for the evaluation form (no backend).
   */
  function initEvalForm() {
    var form = document.getElementById("formAvaliacao");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      var rootEl = document.getElementById("fcEvalRoot");
      var cssStep = rootEl ? rootEl.style.getPropertyValue("--fc-eval-step").trim() : "";
      var notaEl = form.querySelector('input[name="nota"]:checked');
      var lastStepIdx = rootEl
        ? parseInt(rootEl.getAttribute("data-fc-eval-last-step") || "5", 10)
        : 5;
      var stepNum = parseInt(cssStep, 10);
      if (isNaN(stepNum)) stepNum = 0;
      e.preventDefault();
      if (stepNum !== lastStepIdx) {
        return;
      }
      if (!notaEl) {
        if (rootEl && typeof rootEl._fcEvalSetStep === "function") {
          rootEl._fcEvalSetStep(1);
        }
        alert("Escolha uma nota geral (estrelas) antes de enviar.");
        return;
      }
      showThanks(
        "thanksAvaliacao",
        "Recebemos o que você enviou nesta página. Obrigado — sua opinião ajuda a melhorar o Tuto Games."
      );
    });
  }

  function initBugForm() {
    var form = document.getElementById("formBugs");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showThanks(
        "thanksBugs",
        "Muito obrigado por relatar o problema! Vamos analisar assim que o sistema de tickets estiver no ar."
      );
    });
  }

  function initOwnerForm() {
    var form = document.getElementById("formDono");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var idade = parseInt(String(document.getElementById("donoIdade").value || "0"), 10);
      if (idade < 13 || idade > 120) {
        alert("Informe uma idade válida (entre 13 e 120).");
        return;
      }
      showThanks(
        "thanksDono",
        "Muito obrigado! Recebemos seus dados para contato com a equipe (modo demonstração)."
      );
    });
  }

  /**
   * Appends emoji from #chatStickerBar .chat-sticker-btn (data-insert) into #chatBody at caret.
   */
  function initChatStickers() {
    var bar = document.getElementById("chatStickerBar");
    var ta = document.getElementById("chatBody");
    if (!bar || !ta) return;
    bar.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".chat-sticker-btn") : null;
      if (!btn) return;
      var insert = btn.getAttribute("data-insert");
      if (!insert) return;
      var val = ta.value;
      var start = typeof ta.selectionStart === "number" ? ta.selectionStart : val.length;
      var end = typeof ta.selectionEnd === "number" ? ta.selectionEnd : val.length;
      ta.value = val.slice(0, start) + insert + val.slice(end);
      var pos = start + insert.length;
      ta.selectionStart = pos;
      ta.selectionEnd = pos;
      ta.focus();
    });
  }

  function initChat() {
    var listEl = document.getElementById("chatMessages");
    var inputUser = document.getElementById("chatUsername");
    var inputMsg = document.getElementById("chatBody");
    var form = document.getElementById("formChat");
    var banner = document.getElementById("chatSyncBanner");
    if (!listEl || !inputUser || !inputMsg || !form) return;

    initChatStickers();

    var saved = localStorage.getItem(STORAGE_USERNAME);
    if (saved) inputUser.value = saved.slice(0, MAX_USERNAME);

    inputUser.setAttribute("maxlength", String(MAX_USERNAME));

    async function refresh() {
      try {
        var msgs = useRemoteChat() ? await fetchRemoteMessages() : loadLocalMessages();
        renderChatMessages(listEl, msgs, recordReport);
        if (banner) {
          var baseLocal =
            "Modo local: até " +
            MAX_CHAT_MESSAGES +
            " mensagens; as mais antigas que 30 dias são removidas automaticamente. Abas no mesmo aparelho sincronizam.";
          var baseRemote =
            "Modo online (Supabase): a lista exibida segue o mesmo limite (" +
            MAX_CHAT_MESSAGES +
            " / 30 dias) neste navegador. Apagar mensagens (teste) não limpa o banco — só o cache local.";
          banner.textContent = useRemoteChat() ? baseRemote : baseLocal;
        }
      } catch (err) {
        if (banner) {
          banner.textContent =
            "Não foi possível carregar o chat remoto. Verifique Supabase ou use o modo local.";
        }
        renderChatMessages(listEl, loadLocalMessages(), recordReport);
      }
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var rawName = inputUser.value;
      var u = sanitizeUsername(rawName);
      localStorage.setItem(STORAGE_USERNAME, u);
      var body = sanitizeMessageBody(String(inputMsg.value || "").trim());
      if (!body) {
        alert("Escreva uma mensagem antes de enviar.");
        return;
      }
      if (body.replace(/\s/g, "").length === 0) {
        alert("A mensagem não pode ficar só com trechos bloqueados. Escreva algo permitido.");
        return;
      }
      if (body.length > 2000) {
        alert("Mensagem muito longa (máx. 2000 caracteres).");
        return;
      }
      var msg = {
        id: "m_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        username: u,
        body: body,
        ts: Date.now(),
      };
      try {
        if (useRemoteChat()) {
          await sendRemoteMessage(u, body);
        } else {
          appendLocalMessage(msg);
        }
        inputMsg.value = "";
        await refresh();
      } catch (err) {
        alert("Não foi possível enviar agora. Tente de novo em instantes.");
      }
    });

    window.addEventListener("storage", function (ev) {
      if (ev.key === STORAGE_CHAT) refresh();
    });
    try {
      var bc = new BroadcastChannel("tuto-fc-chat");
      bc.onmessage = function () {
        refresh();
      };
    } catch (e) {
      /* ignore */
    }

    /**
     * Enables the red "Apagar mensagens" button only for admin session (after correct Senha adm).
     */
    function syncApagarChatButton() {
      var btn = document.getElementById("btnApagarChat");
      if (!btn) return;
      var ok =
        typeof window.TUTO_hasAdminAccess === "function" && window.TUTO_hasAdminAccess();
      btn.disabled = !ok;
      btn.title = ok
        ? "Apagar todo o histórico do chat neste navegador (ação de teste)."
        : "Disponível após acesso de administrador: digite a senha correta na faixa “Senha adm” no rodapé.";
    }

    window.addEventListener("tuto-admin-unlocked", syncApagarChatButton);
    syncApagarChatButton();

    var btnClear = document.getElementById("btnApagarChat");
    if (btnClear) {
      btnClear.addEventListener("click", async function () {
        if (typeof window.TUTO_hasAdminAccess !== "function" || !window.TUTO_hasAdminAccess()) {
          return;
        }
        if (!window.confirm("Apagar todas as mensagens do chat? (ação de teste)")) {
          return;
        }
        try {
          if (useRemoteChat()) {
            var ok = await deleteAllRemoteMessages();
            if (!ok) {
              alert(
                "Não foi possível apagar no servidor (RLS pode bloquear DELETE). O histórico local foi limpo; ajuste as políticas no Supabase se quiser apagar tudo na nuvem."
              );
            }
          }
        } catch (e) {
          alert("Erro ao contatar o servidor. Limpando apenas o armazenamento local.");
        }
        clearAllLocalChatMessages();
        await refresh();
      });
    }

    setInterval(function () {
      if (!useRemoteChat()) {
        refresh();
      }
    }, 60000);

    refresh();
    if (useRemoteChat()) {
      setInterval(function () {
        refresh();
      }, POLL_MS);
    }
  }

  function init() {
    initEvalWizard();
    initEvalForm();
    initBugForm();
    initOwnerForm();
    initChat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
