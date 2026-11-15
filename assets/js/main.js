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

  var ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function words(n) {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    return String(n);
  }

  /* classes (or source files) from each card's scale line, e.g. "40 classes · …" */
  function classCount() {
    return PLUGINS.reduce(function (sum, p) {
      var m = /(\d+)\s+(classes|files)/.exec(p.scale || "");
      return sum + (m ? +m[1] : 0);
    }, 0);
  }

  /* ---------- sidebar and fixed text ---------- */

  function fillSite() {
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var v = SITE[el.getAttribute("data-site")];
      if (v) { el.textContent = v; }
    });

    $("#bio").textContent = SITE.bio
      .replace("{plugins}", PLUGINS.length)
      .replace("{classes}", classCount());

    var links = contactLinks();
    $("#side-foot").innerHTML = links.map(function (c) {
      var v = c.href ? '<a href="' + esc(c.href) + '"' + (c.ext ? ' rel="noopener"' : "") + ">" + esc(c.v) + "</a>" : "<span>" + esc(c.v) + "</span>";
      return "<div><b>" + esc(c.k) + "</b> " + v + "</div>";
    }).join("");

    $("#hire-list").innerHTML = links.map(function (c) {
      return "<li><small>" + esc(c.k) + "</small>" +
        (c.href ? '<a href="' + esc(c.href) + '"' + (c.ext ? ' rel="noopener"' : "") + ">" + esc(c.v) + "</a>" : "<span>" + esc(c.v) + "</span>") +
        "</li>";
    }).join("");
  }

  function contactLinks() {
    var l = [];
    if (SITE.discord) { l.push({ k: "Discord", v: SITE.discord }); }
    if (SITE.email) { l.push({ k: "Email", v: SITE.email, href: "mailto:" + SITE.email }); }
    if (SITE.github) { l.push({ k: "GitHub", v: SITE.github.replace(/^https?:\/\//, ""), href: SITE.github, ext: true }); }
    return l;
  }

  /* ---------- selected work ---------- */

  function featured() { return FEATURED.map(byId).filter(Boolean); }

  function renderFeatured() {
    var list = featured();
    $("#featured-count").textContent = words(list.length) + " of " + words(PLUGINS.length);

    $("#bento").innerHTML = list.map(function (p) {
      return '<button class="tile" type="button" data-id="' + esc(p.id) + '">' +
        '<span class="ghost" aria-hidden="true">' + esc(p.name.replace(/^Trident/, "")) + "</span>" +
        '<span class="k">' + esc(catLabel(p.category)) + " · " + esc(p.sub) + "</span>" +
        "<h3>" + esc(p.name) + "</h3>" +
        "<p>" + esc(p.pitch) + "</p>" +
        (p.status ? '<span class="status">' + esc(p.status) + "</span>" : "") +
        '<span class="go">' + esc(p.scale) + "</span>" +
        '<span class="arrow" aria-hidden="true">→</span>' +
      "</button>";
    }).join("");
  }

  /* ---------- everything else, grouped ---------- */

  function renderGroups() {
    var shown = FEATURED;
    $("#groups").innerHTML = CATEGORIES.filter(function (c) { return c.id !== "all"; }).map(function (c) {
      var list = PLUGINS.filter(function (p) { return p.category === c.id && shown.indexOf(p.id) < 0; });
      if (!list.length) { return ""; }
      return '<div class="group"><h3>' + esc(c.label) +
          "<small>" + list.length + " plugin" + (list.length > 1 ? "s" : "") + "</small></h3>" +
        '<div class="items">' + list.map(function (p) {
          return '<button class="item" type="button" data-id="' + esc(p.id) + '">' +
            "<b>" + esc(p.name) + "</b><span>" + esc(p.sub) + "</span></button>";
        }).join("") + "</div></div>";
    }).join("");
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
        "</div><div>" +
          "<h3>" + esc(s.name) + "</h3>" +
          '<p class="r">' + esc(s.role) + "</p>" +
          (s.blurb ? "<p>" + esc(s.blurb) + "</p>" : "") +
          (tags ? '<div class="tags">' + tags + "</div>" : "") +
          (s.link ? '<a class="btn btn-primary btn-small" href="' + esc(s.link.href) + '">' + esc(s.link.label) + "</a>" : "") +
          review +
        "</div></article>";
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
      return "<article><h3>" + esc(h.title) + "</h3><p>" + esc(h.text) + "</p></article>";
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
    var t = e.target.closest("[data-id]");
    if (t) { open(t.getAttribute("data-id")); return; }
    if (e.target.closest("[data-close]")) { close(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { close(); }
  });

  /* ---------- the sidebar follows the scroll ---------- */

  function spy() {
    var links = document.querySelectorAll(".toc a");
    if (!("IntersectionObserver" in window)) { return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        links.forEach(function (a) {
          a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".block").forEach(function (b) { io.observe(b); });
  }

  fillSite();
  renderFeatured();
  renderGroups();
  renderServers();
  renderSteps();
  spy();
})();
