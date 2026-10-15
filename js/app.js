"use strict";

/*
 * love-ping — page logic.
 *
 * "Love Ping": press the circle whenever she crosses your mind and get a little
 * line to send her. Counts and history live in localStorage on this device only.
 */

(function () {
  var STORE = "mena-ping";

  var LINES = [
    "Thinking about you \u2014 that's all. \u2665",
    "You just crossed my mind, so here I am.",
    "No reason. Just: you.",
    "I hope your day is being kind to you.",
    "Ping. Because I missed you for a second.",
    "Consider yourself hugged from very far away.",
    "You are my favourite notification.",
    "This is me, sending a small piece of my attention.",
    "If I could, I'd teleport a cup of chai to you right now.",
    "You make ordinary days feel like something.",
    "I smiled at nothing, and the nothing was you.",
    "Checking in on the prettiest thought I have.",
    "Wherever you are, I hope you feel this.",
    "You're not on my mind \u2014 you're the whole thing.",
    "A quiet ping, because loud ones aren't us.",
    "I'd choose the same you, every single time.",
    "Sending you a little of my calm.",
    "The distance is annoying. You're worth it.",
    "You + me + one day, no plans. Perfect.",
    "Just wanted you to know you're thought about.",
    "Consider this a hand on your shoulder.",
    "You are the good part of my ordinary Tuesday.",
    "One ping, because I can't send a whole hug. Yet.",
    "Find me later. I'll be the one smiling about you."
  ];

  var state = { pings: [] };

  /* ---------------- helpers ---------------- */

  function pad2(n) { return String(n).padStart(2, "0"); }

  function dayISO(date) {
    var d = date || new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function pickLine(prev) {
    if (LINES.length < 2) return LINES[0];
    var idx = Math.floor(Math.random() * LINES.length);
    if (LINES[idx] === prev) idx = (idx + 1) % LINES.length;
    return LINES[idx];
  }

  function whenLabel(t) {
    var diff = Date.now() - t;
    if (diff < 45000) return "just now";
    if (diff < 3600000) return Math.round(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.round(diff / 3600000) + "h ago";
    var d = new Date(t);
    return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  }

  /* ---------------- storage ---------------- */

  function load() {
    state.pings = [];
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) { raw = null; }
    var s = null;
    if (raw) { try { s = JSON.parse(raw); } catch (e) { s = null; } }
    if (s && Array.isArray(s.pings)) {
      s.pings.forEach(function (p) {
        if (p && isFinite(p.t) && typeof p.msg === "string") {
          state.pings.push({ t: Math.floor(p.t), msg: p.msg.slice(0, 200) });
        }
      });
    }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------------- actions ---------------- */

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function note(id, message) { setText(id, message); }

  function ping() {
    var prev = state.pings.length ? state.pings[state.pings.length - 1].msg : "";
    var line = pickLine(prev);
    state.pings.push({ t: Date.now(), msg: line });
    save();
    renderPings();
    showMessage(line);
    var btn = document.getElementById("ping-button");
    if (btn && btn.className !== undefined) {
      btn.className = "ping-button is-pinged";
      window.setTimeout(function () { btn.className = "ping-button"; }, 420);
    }
    note("ping-note", "Sent to the universe (and to you) \u2665");
    return line;
  }

  function resetPings() {
    state.pings = [];
    save();
    renderPings();
    var wrap = document.getElementById("ping-message-wrap");
    if (wrap) wrap.hidden = true;
    note("save-note", "The pings are cleared \u2014 start whenever you like.");
  }

  /* ---------------- rendering ---------------- */

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function showMessage(line) {
    var wrap = document.getElementById("ping-message-wrap");
    if (wrap) wrap.hidden = false;
    setText("ping-message", line);
  }

  function renderPings() {
    var today = dayISO();
    var todayCount = state.pings.filter(function (p) { return dayISO(new Date(p.t)) === today; }).length;
    setText("ping-count", todayCount);
    setText("ping-total", state.pings.length);

    var last = state.pings[state.pings.length - 1];
    setText("ping-last", last ? "Last ping " + whenLabel(last.t) : "No pings yet");

    var list = document.getElementById("history-list");
    if (list) {
      list.textContent = "";
      var recent = state.pings.slice(-8).reverse();
      if (!recent.length) {
        var empty = el("li", "ping-history-empty");
        empty.textContent = "Your pings will appear here.";
        list.appendChild(empty);
      } else {
        recent.forEach(function (p) {
          var li = el("li", null);
          var line = el("span", "ping-history-line");
          line.textContent = p.msg;
          var when = el("span", "ping-history-when");
          when.textContent = whenLabel(p.t);
          li.appendChild(line);
          li.appendChild(when);
          list.appendChild(li);
        });
      }
    }
  }

  /* ---------------- events ---------------- */

  function wire() {
    var btn = document.getElementById("ping-button");
    if (btn) btn.addEventListener("click", ping);

    var copy = document.getElementById("copy-ping");
    if (copy) copy.addEventListener("click", function () {
      var msg = document.getElementById("ping-message");
      var text = msg ? msg.textContent : "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { note("ping-note", "Copied \u2665 paste it to her."); })
          .catch(function () { note("ping-note", text); });
        return;
      }
      note("ping-note", text);
    });

    var reset = document.getElementById("reset-pings");
    if (reset) reset.addEventListener("click", resetPings);

    var share = document.getElementById("share-button");
    if (share) share.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { note("save-note", "Link copied \u2665"); })
          .catch(function () { note("save-note", url); });
        return;
      }
      note("save-note", url);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    renderPings();
    wire();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  });
})();
