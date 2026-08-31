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
      var dIcon = SITE.discordIcon
        ? '<img class="contact-icon" src="' + esc(SITE.discordIcon) + '" alt="" aria-hidden="true">'
        : "\u{1F4AC}";
      links.push("<li><span>" + dIcon + " Discord <em>" + esc(SITE.discord) + "</em></span></li>");
    }
    if (SITE.email) {
      links.push('<li><a href="mailto:' + esc(SITE.email) + '">✉ ' + esc(SITE.email) + "</a></li>");
    }
    if (SITE.github) {
      links.push('<li><a href="' + esc(SITE.github) + '" rel="noopener">\u{1F4C1} GitHub</a></li>');
    }
    $("#contact-list").innerHTML = links.join("");

    var svc = $("#services");
    if (svc && SITE.services) {
      svc.innerHTML = SITE.services.map(function (t) {
        return "<li>" + esc(t) + "</li>";
      }).join("");
    }
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

  /* ---------- servers ---------- */

  function renderServers() {
    var host = $("#servers-list");
    if (!host || typeof SERVERS === "undefined") { return; }

    host.innerHTML = SERVERS.map(function (s) {
      var tags = (s.tags || []).map(function (t) {
        return '<li>' + esc(t) + "</li>";
      }).join("");

      var review = "";
      if (s.review) {
        review = '<p class="server-review' + (s.pending ? " is-pending" : "") + '">' +
          (s.pending ? "" : "“") + esc(s.review) + (s.pending ? "" : "”") +
          "</p>";
      }

      return '<article class="server">' +
        '<div class="server-logo">' +
          '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + ' logo" loading="lazy">' +
          '<span class="server-logo-fallback" hidden>' + esc(s.name) + "</span>" +
        "</div>" +
        '<div class="server-body">' +
          '<h3 class="server-name">' + esc(s.name) + "</h3>" +
          '<p class="server-role">' + esc(s.role) + "</p>" +
          (s.blurb ? '<p class="server-blurb">' + esc(s.blurb) + "</p>" : "") +
          (tags ? '<ul class="server-tags">' + tags + "</ul>" : "") +
          review +
        "</div>" +
      "</article>";
    }).join("");

    /* a logo file that is not there yet falls back to the name, so the card
       still reads properly instead of showing a broken-image icon */
    host.querySelectorAll(".server-logo img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.hidden = true;
        var fb = img.parentNode.querySelector(".server-logo-fallback");
        if (fb) { fb.hidden = false; }
      });
    });
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
  renderServers();
})();
