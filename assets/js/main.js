/* Behaviour only. All content lives in data.js. */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  /* text nodes bound to SITE */
  function fillSite() {
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var v = SITE[el.getAttribute("data-site")];
      if (v) { el.textContent = v; }
    });

    $("#stats").innerHTML = SITE.stats.map(function (s) {
      return "<li><b>" + esc(s.n) + "</b><span>" + esc(s.label) + "</span></li>";
    }).join("");

    var links = [];
    if (SITE.discord) {
      links.push("<li><span>\u{1F4AC} Discord <em>" + esc(SITE.discord) + "</em></span></li>");
    }
    if (SITE.email) {
      links.push('<li><a href="mailto:' + esc(SITE.email) + '">✉ ' + esc(SITE.email) + "</a></li>");
    }
    if (SITE.github) {
      links.push('<li><a href="' + esc(SITE.github) + '" rel="noopener">\u{1F4C1} GitHub</a></li>');
    }
    $("#contact-list").innerHTML = links.join("");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- cards ---------- */

  var active = "all";

  function render() {
    var list = active === "all"
      ? PLUGINS
      : PLUGINS.filter(function (p) { return p.category === active; });

    $("#grid").innerHTML = list.map(function (p) {
      return '<button class="card" type="button" data-id="' + esc(p.id) + '">' +
        '<span class="card-top">' +
          '<span class="card-icon" aria-hidden="true">' + p.icon + "</span>" +
          "<span>" +
            '<span class="card-name">' + esc(p.name) + "</span>" +
            '<span class="card-sub">' + esc(p.sub) + "</span>" +
          "</span>" +
        "</span>" +
        '<span class="card-pitch">' + esc(p.pitch) + "</span>" +
        '<span class="card-foot">' +
          '<span class="card-scale">' + esc(p.scale) + "</span>" +
          '<span class="card-more">Details →</span>' +
        "</span>" +
      "</button>";
    }).join("");

    $("#empty").hidden = list.length > 0;
  }

  function buildFilters() {
    $("#filters").innerHTML = CATEGORIES.map(function (c) {
      return '<button class="filter" type="button" role="tab" data-cat="' + c.id + '"' +
        ' aria-selected="' + (c.id === active) + '">' + esc(c.label) + "</button>";
    }).join("");
  }

  /* ---------- modal ---------- */

  var lastFocus = null;

  function open(id) {
    var p = PLUGINS.filter(function (x) { return x.id === id; })[0];
    if (!p) { return; }
    lastFocus = document.activeElement;

    var html =
      '<div class="m-head">' +
        '<div class="card-icon" aria-hidden="true">' + p.icon + "</div>" +
        "<div>" +
          '<div class="m-title" id="modal-title">' + esc(p.name) + "</div>" +
          '<div class="m-sub">' + esc(p.sub) + "</div>" +
          '<span class="m-scale">' + esc(p.scale) + "</span>" +
        "</div>" +
      "</div>" +
      '<p class="m-pitch">' + esc(p.pitch) + "</p>" +
      '<ul class="m-list">' + p.detail.map(function (d) {
        return "<li>" + esc(d) + "</li>";
      }).join("") + "</ul>" +
      (p.note ? '<p class="m-note">' + esc(p.note) + "</p>" : "") +
      '<div class="m-cmds"><h4>Commands</h4><ul>' + p.commands.map(function (c) {
        return "<li><code>" + esc(c) + "</code></li>";
      }).join("") + "</ul></div>";

    $("#modal-body").innerHTML = html;
    $("#modal").hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-close").focus();
  }

  function close() {
    $("#modal").hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) { lastFocus.focus(); }
  }

  /* ---------- wiring ---------- */

  document.addEventListener("click", function (e) {
    var f = e.target.closest(".filter");
    if (f) {
      active = f.getAttribute("data-cat");
      $("#filters").querySelectorAll(".filter").forEach(function (b) {
        b.setAttribute("aria-selected", String(b === f));
      });
      render();
      return;
    }

    var card = e.target.closest(".card");
    if (card) { open(card.getAttribute("data-id")); return; }

    if (e.target.hasAttribute("data-close")) { close(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#modal").hidden) { close(); }
  });

  fillSite();
  buildFilters();
  render();
})();
