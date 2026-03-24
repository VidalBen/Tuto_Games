/**
 * Author: Fabiel Santos
 * Date: 2026-03-22
 * Time: Session (America/Sao_Paulo)
 * Project: benjamin.TESTE — Tuto Games admin gate
 * Purpose: Admin password and full per-page reset (session, lockout, attempts, panel state).
 */
(function (global) {
  "use strict";

  /** @type {string} */
  var SESSION_KEY = "tuto_adm_session_unlocked";

  /** Keys used by admin-panel.js — cleared on every load so the strip always asks for the password again. */
  var RESET_KEYS = [
    SESSION_KEY,
    "tuto_adm_wrong_count",
    "tuto_adm_ui_hidden",
    "tuto_adm_panel_collapsed",
  ];

  /**
   * Every full page load: no admin session, no lockout, no wrong-attempt memory — same as first visit.
   * After reset, the admin strip starts collapsed (user opens via the green control).
   */
  try {
    for (var i = 0; i < RESET_KEYS.length; i++) {
      sessionStorage.removeItem(RESET_KEYS[i]);
    }
    sessionStorage.setItem("tuto_adm_panel_collapsed", "1");
  } catch (e) {
    /* ignore */
  }

  /**
   * Set your admin password here (plain text — for static demo only).
   * When empty, no password unlocks until you set a value.
   * @type {string}
   */
  global.TUTO_ADMIN_PASSWORD = "game";

  /** @type {string} sessionStorage key set only after correct password on the current page. */
  global.TUTO_ADMIN_SESSION_KEY = SESSION_KEY;

  /**
   * @returns {boolean} True if this browser tab has an active admin session (after correct password).
   */
  global.TUTO_hasAdminAccess = function () {
    try {
      return sessionStorage.getItem(global.TUTO_ADMIN_SESSION_KEY) === "1";
    } catch (e) {
      return false;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
