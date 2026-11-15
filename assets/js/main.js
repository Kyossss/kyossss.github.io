/* Behaviour only. All content lives in data.js. */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function byId(id) { return PLUGINS.filter(function (p) { return p.id === id; })[0]; }

  function catLabel(id) {
    var c = CATEGORIES.filter(function (x) { return x.id === id; })[0];
    return c ? c.label : id;
  }

  /* classes (or source files) from each card's scale line, e.g. "40 classes · …" */
  function classCount() {
    return PLUGINS.reduce(function (sum, p) {
      var m = /(\d+)\s+(classes|files)/.exec(p.scale || "");
      return sum + (m ? +m[1] : 0);
    }, 0);
  }

  /* ---------- fixed text ---------- */

  function fillSite() {
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var v = SITE[el.getAttribute("data-site")];
      if (v) { el.textContent = v; }
    });

    $("#bio").textContent = SITE.bio
      .replace("{plugins}", PLUGINS.length)
      .replace("{classes}", classCount());

    $("#facts").innerHTML = [
      [PLUGINS.length, "plugins written"],
      [classCount(), "classes, no forks"],
      ["80+", "players on a server I tuned"]
    ].map(function (f) { return "<li><b>" + esc(f[0]) + "</b><span>" + esc(f[1]) + "</span></li>"; }).join("");

    $("#hire-list").innerHTML = contactLinks().map(function (c) {
      var inner = esc(c.v) + "<small>" + esc(c.k) + "</small>";
      return "<li>" + (c.href
        ? '<a href="' + esc(c.href) + '"' + (c.ext ? ' rel="noopener"' : "") + ">" + inner + "</a>"
        : "<span>" + inner + "</span>") + "</li>";
    }).join("");

    $("#year").textContent = new Date().getFullYear();
  }

  function contactLinks() {
    var l = [];
    if (SITE.discord) { l.push({ k: "Discord", v: SITE.discord }); }
    if (SITE.email) { l.push({ k: "Email", v: SITE.email, href: "mailto:" + SITE.email }); }
    if (SITE.github) { l.push({ k: "GitHub", v: SITE.github.replace(/^https?:\/\//, ""), href: SITE.github, ext: true }); }
    return l;
  }

  /* ---------- plugins: featured first, then the rest by area ---------- */

  function ordered() {
    var first = FEATURED.map(byId).filter(Boolean);
    var rest = [];
    CATEGORIES.forEach(function (c) {
      PLUGINS.forEach(function (p) {
        if (p.category === c.id && FEATURED.indexOf(p.id) < 0) { rest.push(p); }
      });
    });
    return first.concat(rest);
  }

  function renderCards() {
    var used = CATEGORIES.filter(function (c) {
      return c.id === "all" || PLUGINS.some(function (p) { return p.category === c.id; });
    });
    $("#chips").innerHTML = used.map(function (c) {
      return '<button class="chip" type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === "all") + '">' +
        esc(c.id === "all" ? "All" : c.label) + "</button>";
    }).join("");

    $("#cards").innerHTML = ordered().map(function (p) {
      return '<button class="card" type="button" data-id="' + esc(p.id) + '" data-cat="' + esc(p.category) + '">' +
        '<span class="k">' + esc(catLabel(p.category)) + "</span>" +
        "<h3>" + esc(p.name) + "</h3>" +
        "<p>" + esc(p.pitch) + "</p>" +
        (p.status ? '<span class="status">' + esc(p.status) + "</span>" : "") +
        '<span class="go"><span>' + esc(p.scale) + '</span><i aria-hidden="true">→</i></span>' +
      "</button>";
    }).join("");
  }

  /* "All" shows the featured plugins until "Show all" is pressed;
     an area chip always shows everything in that area */
  var current = "all", expanded = false;

  function filter(cat) {
    current = cat;
    document.querySelectorAll("#chips .chip").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-cat") === cat));
    });
    document.querySelectorAll("#cards .card").forEach(function (c) {
      var id = c.getAttribute("data-id");
      c.hidden = cat === "all"
        ? !expanded && FEATURED.indexOf(id) < 0
        : c.getAttribute("data-cat") !== cat;
    });
    var more = $("#more");
    more.hidden = cat !== "all" || expanded;
    more.textContent = "Show all " + PLUGINS.length + " plugins";
  }

  /* ---------- servers ---------- */

  function renderServers() {
    $("#server-list").innerHTML = SERVERS.map(function (s) {
      var tags = (s.tags || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
      var review = "";
      if (s.review) {
        review = '<p class="q' + (s.pending ? ' pending">' + esc(s.review) : '">“' + esc(s.review) + "”") + "</p>";
      }
      return '<article class="srv">' +
        '<div class="logo">' +
          '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + ' logo" loading="lazy"' + (s.pixelLogo ? ' class="px"' : "") + ">" +
          '<span class="logo-fallback" hidden>' + esc(s.name) + "</span>" +
        "</div>" +
        "<h3>" + esc(s.name) + "</h3>" +
        '<p class="r">' + esc(s.role) + "</p>" +
        (s.blurb ? "<p>" + esc(s.blurb) + "</p>" : "") +
        (tags ? '<div class="tags">' + tags + "</div>" : "") +
        (s.link ? '<a class="btn btn-primary btn-small" href="' + esc(s.link.href) + '">' + esc(s.link.label) + "</a>" : "") +
        review +
      "</article>";
    }).join("");

    /* a logo file that is not there yet falls back to the server's name */
    document.querySelectorAll("#server-list .logo img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.hidden = true;
        var fb = img.parentNode.querySelector(".logo-fallback");
        if (fb) { fb.hidden = false; }
      });
    });
  }

  function renderSteps() {
    $("#steps").innerHTML = HOW.map(function (h) {
      return "<li><h3>" + esc(h.title) + "</h3><p>" + esc(h.text) + "</p></li>";
    }).join("");
  }

  /* ---------- the detail drawer ---------- */

  var drawer = $("#drawer");
  var lastFocus = null;

  function open(id) {
    var p = byId(id);
    if (!p) { return; }
    lastFocus = document.activeElement;

    $("#drawer-body").innerHTML =
      '<span class="k">' + esc(catLabel(p.category)) + "</span>" +
      '<h2 id="drawer-title">' + esc(p.name) + "</h2>" +
      '<span class="sc">' + esc(p.sub) + " · " + esc(p.scale) + "</span>" +
      '<p class="lead">' + esc(p.pitch) + "</p>" +
      "<ul>" + p.detail.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" +
      (p.note ? '<p class="nt">' + esc(p.note) + "</p>" : "") +
      "<h4>Commands</h4><div>" + p.commands.map(function (c) { return "<code>" + esc(c) + "</code>"; }).join("") + "</div>";

    drawer.inert = false;
    drawer.removeAttribute("inert");
    document.body.classList.add("drawer-open", "locked");
    drawer.scrollTop = 0;
    drawer.querySelector(".x").focus();
  }

  function close() {
    if (!document.body.classList.contains("drawer-open")) { return; }
    document.body.classList.remove("drawer-open", "locked");
    drawer.inert = true;
    drawer.setAttribute("inert", "");
    if (lastFocus) { lastFocus.focus(); }
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("#more")) { expanded = true; filter(current); return; }
    var chip = e.target.closest(".chip[data-cat]");
    if (chip) { filter(chip.getAttribute("data-cat")); return; }
    var t = e.target.closest("[data-id]");
    if (t) { open(t.getAttribute("data-id")); return; }
    if (e.target.closest("[data-close]")) { close(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { close(); }
  });

  fillSite();
  renderCards();
  filter("all");
  renderServers();
  renderSteps();
})();
