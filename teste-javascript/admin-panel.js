/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games admin strip
 * Purpose: Fixed admin strip with close (×) and green reopen control; wrong-attempt phases; unlock hook.
 */

(function () {
  "use strict";

  var STORAGE_WRONG = "tuto_adm_wrong_count";
  var STORAGE_HIDDEN = "tuto_adm_ui_hidden";
  var STORAGE_COLLAPSED = "tuto_adm_panel_collapsed";

  var MSG_PHASE_1 =
    "Isto é só para administradores. Por favor, não mexa.";
  var MSG_PHASE_2 = "Eu já avisei — pare de mexer.";
  var MSG_PHASE_3 = "Último aviso.";
  var MSG_FINAL = "Eu avisei.";

  /**
   * @returns {number}
   */
  function getWrongCount() {
    var n = parseInt(sessionStorage.getItem(STORAGE_WRONG) || "0", 10);
    return isNaN(n) ? 0 : n;
  }

  /**
   * @param {number} n
   */
  function setWrongCount(n) {
    sessionStorage.setItem(STORAGE_WRONG, String(n));
  }

  /**
   * @returns {boolean}
   */
  function isUiHidden() {
    return sessionStorage.getItem(STORAGE_HIDDEN) === "1";
  }

  function setUiHidden() {
    sessionStorage.setItem(STORAGE_HIDDEN, "1");
  }

  function clearAdminState() {
    sessionStorage.removeItem(STORAGE_WRONG);
    sessionStorage.removeItem(STORAGE_HIDDEN);
    sessionStorage.removeItem(STORAGE_COLLAPSED);
    if (typeof window.TUTO_ADMIN_SESSION_KEY === "string") {
      sessionStorage.removeItem(window.TUTO_ADMIN_SESSION_KEY);
    } else {
      sessionStorage.removeItem("tuto_adm_session_unlocked");
    }
  }

  /**
   * @param {number} w Wrong attempts after increment
   * @returns {string}
   */
  function messageForWrongCount(w) {
    if (w <= 3) return MSG_PHASE_1;
    if (w <= 6) return MSG_PHASE_2;
    if (w <= 9) return MSG_PHASE_3;
    return MSG_FINAL;
  }

  /**
   * Builds and mounts the admin UI.
   */
  function mount() {
    document.body.classList.add("has-admin-strip");

    var strip = document.createElement("aside");
    strip.className = "admin-strip";
    strip.setAttribute("aria-label", "Área administrativa");

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "admin-strip__close";
    closeBtn.setAttribute("aria-label", "Fechar painel administrativo");
    closeBtn.innerHTML = "&times;";

    var inner = document.createElement("div");
    inner.className = "admin-strip__inner";

    var title = document.createElement("p");
    title.className = "admin-strip__title";
    title.textContent = "Senha adm";

    var feedback = document.createElement("p");
    feedback.className = "admin-strip__feedback";
    feedback.id = "tutoAdminFeedback";
    feedback.setAttribute("aria-live", "polite");

    var form = document.createElement("form");
    form.className = "admin-strip__form";
    form.id = "tutoAdminForm";
    form.autocomplete = "off";

    var input = document.createElement("input");
    input.type = "password";
    input.name = "adm";
    input.id = "tutoAdminInput";
    input.maxLength = 128;
    input.setAttribute("autocomplete", "new-password");
    input.setAttribute("aria-label", "Senha de administrador");

    var submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "btn btn--ghost admin-strip__submit";
    submit.textContent = "Entrar";

    form.appendChild(input);
    form.appendChild(submit);

    var restore = document.createElement("button");
    restore.type = "button";
    restore.className = "admin-strip__restore";
    restore.textContent = "Restaurar painel (teste)";
    restore.title = "Zera tentativas e volta o campo de senha (como ao abrir o site de novo em nova aba).";

    restore.addEventListener("click", function () {
      clearAdminState();
      window.location.reload();
    });

    if (getWrongCount() >= 10) {
      setUiHidden();
    }

    inner.appendChild(title);
    inner.appendChild(form);
    inner.appendChild(feedback);
    inner.appendChild(restore);
    strip.appendChild(closeBtn);
    strip.appendChild(inner);

    var reopenBtn = document.createElement("button");
    reopenBtn.type = "button";
    reopenBtn.className = "admin-strip__reopen";
    reopenBtn.setAttribute("aria-label", "Abrir painel administrativo");
    reopenBtn.setAttribute("aria-hidden", "true");
    reopenBtn.hidden = true;
    reopenBtn.innerHTML =
      '<span class="admin-strip__reopen-icon" aria-hidden="true">&#9650;</span>';

    document.body.appendChild(strip);
    document.body.appendChild(reopenBtn);

    /**
     * @param {boolean} collapsed
     */
    function setPanelCollapsed(collapsed) {
      if (collapsed) {
        strip.classList.add("admin-strip--closed");
        document.body.classList.add("admin-strip-panel-closed");
        strip.setAttribute("aria-hidden", "true");
        reopenBtn.hidden = false;
        reopenBtn.setAttribute("aria-hidden", "false");
        sessionStorage.setItem(STORAGE_COLLAPSED, "1");
      } else {
        strip.classList.remove("admin-strip--closed");
        document.body.classList.remove("admin-strip-panel-closed");
        strip.setAttribute("aria-hidden", "false");
        reopenBtn.hidden = true;
        reopenBtn.setAttribute("aria-hidden", "true");
        sessionStorage.removeItem(STORAGE_COLLAPSED);
      }
    }

    closeBtn.addEventListener("click", function () {
      setPanelCollapsed(true);
    });

    reopenBtn.addEventListener("click", function () {
      setPanelCollapsed(false);
    });

    if (sessionStorage.getItem(STORAGE_COLLAPSED) === "1") {
      setPanelCollapsed(true);
    }

    function applyHiddenState() {
      if (!isUiHidden()) return;
      form.style.display = "none";
      title.style.display = "none";
      feedback.textContent = MSG_FINAL;
      feedback.classList.add("admin-strip__feedback--final");
    }

    function onWrong() {
      var w = getWrongCount() + 1;
      setWrongCount(w);
      feedback.textContent = messageForWrongCount(w);
      feedback.classList.add("admin-strip__feedback--warn");
      if (w >= 10) {
        setUiHidden();
        applyHiddenState();
      }
      input.value = "";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isUiHidden()) return;

      var pwd = String(input.value || "");
      var expected = typeof window.TUTO_ADMIN_PASSWORD === "string" ? window.TUTO_ADMIN_PASSWORD : "";

      if (pwd.length === 0) {
        feedback.textContent = "Digite uma senha.";
        return;
      }

      if (expected.length > 0 && pwd === expected) {
        setWrongCount(0);
        sessionStorage.removeItem(STORAGE_HIDDEN);
        var sk =
          typeof window.TUTO_ADMIN_SESSION_KEY === "string"
            ? window.TUTO_ADMIN_SESSION_KEY
            : "tuto_adm_session_unlocked";
        sessionStorage.setItem(sk, "1");
        feedback.textContent =
          "Acesso concedido à configuração de administrador (admin-config). Recursos restritos do site — como apagar o chat público — ficam disponíveis nesta sessão.";
        feedback.classList.remove("admin-strip__feedback--warn");
        feedback.classList.remove("admin-strip__feedback--final");
        try {
          window.dispatchEvent(new CustomEvent("tuto-admin-unlocked"));
        } catch (err) {
          /* ignore */
        }
        if (typeof window.TUTO_onAdminUnlock === "function") {
          try {
            window.TUTO_onAdminUnlock();
          } catch (err2) {
            /* ignore */
          }
        }
        input.value = "";
        return;
      }

      if (expected.length === 0) {
        onWrong();
        return;
      }

      onWrong();
    });

    applyHiddenState();

    var w0 = getWrongCount();
    if (w0 > 0 && !isUiHidden()) {
      feedback.textContent = messageForWrongCount(w0);
      feedback.classList.add("admin-strip__feedback--warn");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
