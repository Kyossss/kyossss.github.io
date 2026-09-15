/*
 * review.html — behaviour.
 *
 * Reads its configuration from REVIEW in data.js. You should not need to
 * touch this file; the webhook URL and the wording live over there.
 *
 * There is no server behind this page. A submitted review is POSTed
 * straight to a Discord webhook, which is the only place it is ever
 * stored. If the webhook is not configured, or the POST fails, the page
 * falls back to handing the client their review as text to send you.
 */
(function () {
  "use strict";

  var CFG = (typeof REVIEW === "object" && REVIEW) || {};
  var SITE_ = (typeof SITE === "object" && SITE) || {};

  /* The four things a client is asked to score. Renaming one only
     changes the label — nothing else reads these strings. */
  var CRITERIA = CFG.criteria || [
    { id: "communication", name: "Communication", sub: "Kept you in the loop, answered clearly." },
    { id: "speed",         name: "Speed",         sub: "Delivered in the time it should have taken." },
    { id: "results",       name: "Results",       sub: "The work actually solved the problem." },
    { id: "value",         name: "Value",         sub: "Worth what you paid for it." }
  ];

  var WORDS = ["", "Poor", "Below par", "Solid", "Very good", "Could not fault it"];
  var MAX_METRICS = 6;

  var $ = function (id) { return document.getElementById(id); };
  var scores = {};

  /* ---------- small helpers ---------- */

  function text(el, s) { el.textContent = s; }

  function clean(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  }

  /* Discord renders markdown. Neutralise the characters that would turn a
     client's plain sentence into formatting, and the mention forms. */
  function forDiscord(s) {
    return clean(s)
      .replace(/([*_`~|\\>])/g, "\\$1")
      .replace(/@(everyone|here)/gi, "@​$1");
  }

  /* ---------- prefill from the link ---------- */

  var params = new URLSearchParams(location.search);
  var qServer = clean(params.get("server") || params.get("s"));
  var qName = clean(params.get("name") || params.get("n"));

  if (qServer) {
    $("f-server").value = qServer;
    text($("rv-eyebrow"), "Client review · " + qServer);
    text($("rv-title"), "How did I do on " + qServer + "?");
    document.title = "Review — " + qServer + " · Kyoss";
  }
  if (qName) $("f-name").value = qName;

  /* ---------- ratings ---------- */

  var ratingsHost = $("f-ratings");

  CRITERIA.forEach(function (c) {
    var row = document.createElement("div");
    row.className = "rv-rating";
    row.dataset.criterion = c.id;

    var t = document.createElement("div");
    t.className = "rv-rating-text";
    t.innerHTML =
      '<span class="rv-rating-name"></span><span class="rv-rating-sub"></span>';
    t.firstChild.textContent = c.name;
    t.lastChild.textContent = c.sub;

    var stars = document.createElement("div");
    stars.className = "rv-stars";
    stars.setAttribute("role", "radiogroup");
    stars.setAttribute("aria-label", c.name);

    for (var i = 1; i <= 5; i++) {
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "rating-" + c.id;
      input.id = "r-" + c.id + "-" + i;
      input.value = String(i);

      var label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.dataset.value = String(i);
      label.textContent = "★";
      label.title = i + " — " + WORDS[i];
      label.setAttribute("aria-label", i + " out of 5, " + WORDS[i]);

      stars.appendChild(input);
      stars.appendChild(label);
    }

    var value = document.createElement("span");
    value.className = "rv-rating-value";

    row.appendChild(t);
    row.appendChild(stars);
    row.appendChild(value);
    ratingsHost.appendChild(row);

    /* hover previews a score without committing to it */
    stars.addEventListener("mouseover", function (e) {
      if (e.target.dataset && e.target.dataset.value) paintStars(row, +e.target.dataset.value);
    });
    stars.addEventListener("mouseleave", function () {
      paintStars(row, scores[c.id] || 0);
    });
    stars.addEventListener("change", function (e) {
      scores[c.id] = +e.target.value;
      row.classList.add("is-set");
      paintStars(row, scores[c.id]);
      update();
    });
  });

  function paintStars(row, n) {
    var labels = row.querySelectorAll(".rv-stars label");
    for (var i = 0; i < labels.length; i++) {
      labels[i].classList.toggle("is-lit", i < n);
    }
    var set = scores[row.dataset.criterion] || 0;
    text(row.querySelector(".rv-rating-value"), set ? set + " — " + WORDS[set] : "");
  }

  /* ---------- optional before/after numbers ---------- */

  var metricsHost = $("f-metrics");

  function addMetric(seed) {
    if (metricsHost.children.length >= MAX_METRICS) return;

    var row = document.createElement("div");
    row.className = "rv-metric";

    var fields = [
      { key: "label",  ph: CFG.metricPlaceholder || "What was measured", val: (seed && seed.label) || "" },
      { key: "before", ph: "Before",                                     val: (seed && seed.before) || "" },
      { key: "after",  ph: "After",                                      val: (seed && seed.after) || "" }
    ];

    fields.forEach(function (f) {
      var input = document.createElement("input");
      input.type = "text";
      input.maxLength = 48;
      input.placeholder = f.ph;
      input.value = f.val;
      input.dataset.key = f.key;
      input.addEventListener("input", update);
      row.appendChild(input);
    });

    var drop = document.createElement("button");
    drop.type = "button";
    drop.className = "rv-metric-drop";
    drop.setAttribute("aria-label", "Remove this row");
    drop.textContent = "×";
    drop.addEventListener("click", function () {
      row.remove();
      if (!metricsHost.children.length) addMetric();
      update();
    });
    row.appendChild(drop);

    metricsHost.appendChild(row);
  }

  addMetric();
  $("rv-add-metric").addEventListener("click", function () {
    addMetric();
    var rows = metricsHost.children;
    if (rows.length) rows[rows.length - 1].querySelector("input").focus();
  });

  function readMetrics() {
    var out = [];
    var rows = metricsHost.querySelectorAll(".rv-metric");
    for (var i = 0; i < rows.length; i++) {
      var get = function (k) {
        var el = rows[i].querySelector('input[data-key="' + k + '"]');
        return clean(el ? el.value : "");
      };
      var m = { label: get("label"), before: get("before"), after: get("after") };
      if (m.label && (m.before || m.after)) out.push(m);
    }
    return out;
  }

  /* ---------- reading the whole form ---------- */

  function checkedValues(name) {
    var out = [];
    var nodes = document.querySelectorAll('input[name="' + name + '"]:checked');
    for (var i = 0; i < nodes.length; i++) out.push(nodes[i].value);
    return out;
  }

  function read() {
    var again = checkedValues("again");
    return {
      name:    clean($("f-name").value),
      server:  clean($("f-server").value),
      discord: clean($("f-discord").value),
      services: checkedValues("service"),
      scores:  scores,
      again:   again.length ? again[0] : "",
      before:  clean($("f-before").value),
      after:   clean($("f-after").value),
      improve: clean($("f-improve").value),
      metrics: readMetrics(),
      publish: $("f-publish").checked,
      publishNumbers: $("f-publish-numbers").checked
    };
  }

  function average(d) {
    var sum = 0, n = 0;
    CRITERIA.forEach(function (c) {
      if (d.scores[c.id]) { sum += d.scores[c.id]; n++; }
    });
    return n ? sum / n : 0;
  }

  /* The quote as it would be published: the two answers, run together. */
  function quoteOf(d) {
    return [d.before, d.after].filter(Boolean).join(" ");
  }

  /* ---------- live preview ---------- */

  var preview = document.querySelector(".rv-preview");

  function renderPreview(d) {
    var avg = average(d);
    var rounded = Math.round(avg);
    text($("pv-stars"), rounded ? "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded) : "");

    var quote = quoteOf(d);
    var q = $("pv-quote");
    q.classList.toggle("is-empty", !quote);
    text(q, quote || "Your words appear here as you type.");

    text($("pv-name"), d.name || "Your name");
    text($("pv-server"), d.server || "Your server");

    var list = $("pv-metrics");
    list.innerHTML = "";
    if (d.publishNumbers) {
      d.metrics.forEach(function (m) {
        var li = document.createElement("li");
        var b = document.createElement("b");
        b.textContent = m.label;
        li.appendChild(b);
        if (m.before) li.appendChild(document.createTextNode(" " + m.before));
        var arrow = document.createElement("span");
        arrow.className = "rv-arrow";
        arrow.textContent = "→";
        li.appendChild(arrow);
        var to = document.createElement("span");
        to.className = "rv-to";
        to.textContent = m.after || "—";
        li.appendChild(to);
        list.appendChild(li);
      });
    }

    preview.classList.toggle("is-live", d.publish);
    text(
      $("pv-foot"),
      d.publish
        ? "Published as shown, with your name and server. Ask me to remove it at any time and I will."
        : "Not published — the permission box is unticked. I am the only person who sees this."
    );
  }

  /* ---------- progress ---------- */

  function renderProgress(d) {
    var done = 0, total = 4 + CRITERIA.length;
    if (d.name) done++;
    if (d.server) done++;
    if (d.before) done++;
    if (d.after) done++;
    CRITERIA.forEach(function (c) { if (d.scores[c.id]) done++; });
    $("rv-bar").style.width = Math.round((done / total) * 100) + "%";
  }

  /* ---------- character counters ---------- */

  var counters = document.querySelectorAll(".rv-count");

  function renderCounts() {
    for (var i = 0; i < counters.length; i++) {
      var el = $(counters[i].dataset.countFor);
      if (!el) continue;
      var used = el.value.length, max = el.maxLength;
      counters[i].textContent = used ? used + " / " + max : "";
      counters[i].classList.toggle("is-near", used > max - 80);
    }
  }

  /* ---------- the one update path ---------- */

  function update() {
    var d = read();
    var anyMetrics = d.metrics.length > 0;
    var wrap = $("f-publish-numbers-wrap");
    wrap.hidden = !anyMetrics;
    if (!anyMetrics && $("f-publish-numbers").checked) {
      $("f-publish-numbers").checked = false;
      d.publishNumbers = false;
    }
    renderPreview(d);
    renderProgress(d);
    renderCounts();
  }

  $("rv-form").addEventListener("input", update);
  $("rv-form").addEventListener("change", update);

  /* ---------- validation ---------- */

  function fieldOf(el) { return el.closest(".rv-field"); }

  function validate(d) {
    var bad = [];
    var pairs = [
      [$("f-name"),   d.name],
      [$("f-server"), d.server],
      [$("f-before"), d.before],
      [$("f-after"),  d.after]
    ];

    pairs.forEach(function (p) {
      var f = fieldOf(p[0]);
      var ok = !!p[1];
      if (f) f.classList.toggle("is-bad", !ok);
      if (!ok) bad.push(p[0]);
    });

    var missingScore = CRITERIA.filter(function (c) { return !d.scores[c.id]; });
    if (missingScore.length) {
      return { ok: false, focus: bad[0], message: "Please score all four — " +
        missingScore.map(function (c) { return c.name.toLowerCase(); }).join(", ") + " still blank." };
    }
    if (bad.length) {
      return { ok: false, focus: bad[0], message: "A few fields are still empty." };
    }
    return { ok: true };
  }

  /* ---------- what gets sent ---------- */

  function payload(d) {
    var avg = average(d);
    var stars = function (n) { return "★".repeat(n) + "☆".repeat(5 - n); };

    var fields = [];

    CRITERIA.forEach(function (c) {
      fields.push({
        name: c.name,
        value: stars(d.scores[c.id]) + "  " + d.scores[c.id] + "/5",
        inline: true
      });
    });

    fields.push({ name: "Hire again", value: d.again || "not answered", inline: true });
    fields.push({
      name: "Work",
      value: d.services.length ? d.services.map(forDiscord).join(", ") : "not stated",
      inline: true
    });

    fields.push({ name: "Before", value: forDiscord(d.before).slice(0, 1024) });
    fields.push({ name: "After", value: forDiscord(d.after).slice(0, 1024) });

    if (d.improve) {
      fields.push({ name: "To do better (private)", value: forDiscord(d.improve).slice(0, 1024) });
    }

    if (d.metrics.length) {
      fields.push({
        name: "Numbers" + (d.publishNumbers ? "" : " — NOT cleared for publication"),
        value: d.metrics.map(function (m) {
          return "• " + forDiscord(m.label) + ": " + forDiscord(m.before || "—") +
                 " → " + forDiscord(m.after || "—");
        }).join("\n").slice(0, 1024)
      });
    }

    fields.push({
      name: "Permission",
      value: d.publish
        ? "✅ CLEARED for publication (name + server + quote)" +
          (d.metrics.length ? (d.publishNumbers ? " + numbers" : ", numbers withheld") : "")
        : "🔒 PRIVATE — do not publish anything from this review"
    });

    if (d.discord) fields.push({ name: "Discord", value: forDiscord(d.discord), inline: true });

    return {
      username: (SITE_.handle || "Kyoss") + " — reviews",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: forDiscord(d.server) + " — " + avg.toFixed(1) + "/5",
        description: "Review from **" + forDiscord(d.name) + "**",
        color: d.publish ? 0xb794f6 : 0x847ca6,
        fields: fields.slice(0, 25),
        footer: { text: d.publish ? "Cleared to publish" : "Private feedback" },
        timestamp: new Date().toISOString()
      }]
    };
  }

  /* The fallback when the webhook is unreachable: plain text the client
     can paste to me themselves, so a written review is never lost. */
  function asPlainText(d) {
    var lines = [
      "Review for " + (SITE_.handle || "Kyoss"),
      "From: " + d.name + " (" + d.server + ")",
      d.discord ? "Discord: " + d.discord : "",
      ""
    ];
    CRITERIA.forEach(function (c) { lines.push(c.name + ": " + d.scores[c.id] + "/5"); });
    lines.push("Hire again: " + (d.again || "not answered"));
    lines.push("");
    lines.push("Before: " + d.before);
    lines.push("After: " + d.after);
    if (d.improve) lines.push("Do better: " + d.improve);
    d.metrics.forEach(function (m) {
      lines.push("Numbers: " + m.label + " " + (m.before || "—") + " -> " + (m.after || "—"));
    });
    lines.push("");
    lines.push(d.publish ? "Permission: may be published." : "Permission: private, do not publish.");
    return lines.filter(function (l) { return l !== ""; }).join("\n");
  }

  /* ---------- submit ---------- */

  var form = $("rv-form");
  var status = $("rv-status");
  var sendBtn = $("rv-send");
  var sending = false;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;

    var d = read();
    var v = validate(d);
    status.classList.remove("is-bad");

    if (!v.ok) {
      status.classList.add("is-bad");
      text(status, v.message);
      if (v.focus) v.focus.focus();
      return;
    }

    if (!CFG.webhook) {
      finish(d, "nowebhook");
      return;
    }

    sending = true;
    sendBtn.disabled = true;
    text(status, "Sending…");

    fetch(CFG.webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload(d))
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        finish(d, "sent");
      })
      .catch(function () {
        sending = false;
        sendBtn.disabled = false;
        status.classList.add("is-bad");
        text(status, "That did not go through. Try once more — or copy your review below and send it to me directly.");
        offerFallback(d);
      });
  });

  function offerFallback(d) {
    if ($("rv-fallback")) return;
    var box = document.createElement("textarea");
    box.id = "rv-fallback";
    box.readOnly = true;
    box.rows = 10;
    box.value = asPlainText(d);
    box.style.width = "100%";
    box.style.marginTop = ".6rem";
    box.className = "rv-fallback";
    status.parentNode.appendChild(box);
    box.focus();
    box.select();
  }

  function finish(d, how) {
    document.querySelector(".rv-wrap").hidden = true;
    document.querySelector(".rv-hero").hidden = true;
    document.querySelector(".rv-progress").hidden = true;

    var done = $("rv-done");
    done.hidden = false;

    if (how === "nowebhook") {
      text($("rv-done-title"), "Almost — one step left.");
      text($("rv-done-body"),
        "This page has no delivery address configured, so nothing was sent. Copy the text " +
        "below and send it to " + (SITE_.handle || "me") + " on Discord" +
        (SITE_.discord ? " (" + SITE_.discord + ")" : "") + ".");
      var box = document.createElement("textarea");
      box.readOnly = true;
      box.rows = 12;
      box.value = asPlainText(d);
      box.style.width = "100%";
      box.className = "rv-fallback";
      done.insertBefore(box, done.querySelector(".btn"));
      box.focus();
      box.select();
      return;
    }

    text($("rv-done-title"), "Thank you, " + d.name.split(" ")[0] + ".");
    text($("rv-done-body"), d.publish
      ? "That is with me. With your permission it will appear on the site under " +
        d.server + " — and if you ever want it taken down, just say so."
      : "That is with me, and it stays with me. Nothing from it will appear anywhere.");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- contact details from data.js ---------- */

  var handleEls = document.querySelectorAll('[data-site="handle"]');
  for (var h = 0; h < handleEls.length; h++) {
    if (SITE_.handle) handleEls[h].textContent = SITE_.handle;
  }

  update();
})();
