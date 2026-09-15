# Plugin portfolio

A static portfolio of the eleven Trident plugins I authored, aimed at Minecraft server
owners. Plain HTML, CSS and JavaScript — no build step, no dependencies, no Node.
Open `index.html` in a browser and it works.

```
Portfolio/
├── index.html              the page structure
├── review.html             the client review form — sent by link, not linked to
├── .nojekyll               stops GitHub Pages running Jekyll over it
└── assets/
    ├── css/style.css       the whole stylesheet; design tokens at the top
    ├── css/review.css      the review page only; reads the same tokens
    ├── js/data.js          ← EDIT THIS. Every word on the site.
    ├── js/main.js          behaviour: filters, modal. You should not need to touch it.
    ├── js/review.js        behaviour: the review form. Same — configure it in data.js.
    └── img/favicon.svg
```

## The only file you need to edit

**`assets/js/data.js`.** The intro, the stat tiles, the contact details, and all eleven
plugin entries live there as plain objects. Change a value, save, refresh.

### Contact details

Set in `SITE`: Discord `kyoss`, email `Kyoush303@gmail.com`, GitHub
`https://github.com/Kyossss` — confirm the GitHub username is right before publishing.

A contact entry with no value is simply not rendered, so deleting one is safe.

## What is on it, and what is not

Eleven plugins: **TridentSkins, TridentCameraAPI, TridentEmotes, TridentPets,
TridentSocials, TridentTrade, TridentDuels, TridentUtilities, TridentGravestone,
TridentNotify, CombatSystem.**

Deliberately excluded: **TridentCore, Lands, Ranks, Menu, Backpack, Avatars, Chests** —
majority-authored by M0rk, and **TridentShowcase**, which Kyo confirmed is not his despite
git reading that way. The "How I work" section still refers to the shared architecture,
because that is the context these eleven run in, but it claims none of those plugins as
mine.

### On the Antigravity byline

`TridentTrade` and `TridentNotify` carry `authors: [Antigravity]` in their `plugin.yml`,
and `TridentTrade/README.md` repeats it. **Antigravity is the AI coding tool, not a
person** — see `TridentSkins/tridentskin-wardrobe-antigravity-brief.md`, which opens
"Paste everything below into Antigravity as the task description." It is a tool credit, so
it is not carried onto this page and both plugins are listed as mine.

Those bylines still sit in the plugin source. Changing them is a separate job: it touches
two shipped plugins and so needs a version bump and a deploy each, per the suite's release
rules.

Every claim on the page is drawn from the module READMEs in `TridentPlugins/`. If a plugin
changes, the page does not update itself — edit `data.js`.

## Publishing to GitHub Pages

This is a **personal** portfolio, so it should not live in `M0rkkk05/TridentPlugins` — a
page served from there lands at `m0rkkk05.github.io/TridentPlugins/…`, which is the wrong
name on your own portfolio. Put it in a repo on your own account.

### Option A — user site, `kyossss.github.io` (recommended)

Gives you the clean root URL `https://kyossss.github.io`. Create a **public** repo named
exactly `kyossss.github.io` on your account, then from this folder:

```bash
git init
git add .
git commit -m "Plugin portfolio"
git branch -M main
git remote add origin https://github.com/Kyossss/kyossss.github.io.git
git push -u origin main
```

Pages turns itself on for a repo with that name. Live in about a minute.

### Option B — project site

Any repo name, e.g. `plugin-portfolio`. Same commands with that name, then in the repo:
**Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**. The URL is
`https://kyossss.github.io/plugin-portfolio/`.

### Notes

- The repo must be **public** for Pages, unless you are on a paid GitHub plan.
- Nothing here reads a server, a database or a credential. It is safe to publish as-is.
- All paths are relative, so both options work with no edits.

## Servers section

`SERVERS` in `data.js` drives the "Servers I worked on" cards. Logos live in
`assets/img/servers/`.

**Filenames must be lowercase.** Windows ignores case, GitHub Pages does not, so a logo
saved as `TokyoCore.png` works locally and 404s once published. A missing logo falls back
to the server name as text rather than a broken image.

Set `pending: true` on a server whose `review` has not arrived yet — it renders as muted
uppercase text instead of as a quote.

## The client review page

`review.html` is the link you send a client the day a contract closes. It is reusable —
one page, every client — and it is not linked from anywhere on the site (`noindex`, no nav
entry), so the only way to it is the link you send.

Put the client's server on the end and the page greets them by name:

```
https://kyossss.github.io/review.html?server=Tokyo%20Core%20SMP
```

`?name=` pre-fills their name too, if you want to save them the typing.

### One thing to set up, once

`REVIEW.webhook` in `data.js`. In Discord: **Server Settings → Integrations → Webhooks →
New Webhook**, pointed at a private channel only you can read. Copy the URL in. Every
submitted review arrives there as an embed within seconds — that channel is the only place
a review is ever stored. There is no database and no server behind this page.

**The URL is readable by anyone who views the page source.** That is the price of having no
backend: someone who goes looking can post junk into that one channel. If it ever happens,
delete the webhook in Discord and paste the new URL here — the old one dies instantly. So
point it at a throwaway channel, never one that matters.

Leave `webhook` empty and the page still works end to end: it hands the client their
finished review as text to send you directly, rather than losing it.

### What the client sees

Four star ratings, a hire-again answer, two short written questions, and an optional
before/after numbers table. A live preview card beside the form shows exactly what would
appear on your site, updating as they type.

Two things are deliberate and worth not undoing:

- **Nothing is published unless they tick the permission box**, and the preview says so in
  plain words either way. The numbers have their own separate tick, because a client under
  an NDA can be happy to praise you and still not want their server's figures public.
- **"What should I do better next time?" is never published**, and the form says so. That
  is the field that gets you an honest answer.

### When a review arrives

Paste it into `SERVERS` in `data.js` — `review:` for the quote, and drop `pending: true`.
Only publish what the permission field in the Discord embed says you may.

## Adding a plugin

Append an object to `PLUGINS` in `data.js`:

```js
{
  id: "example",              // unique, used by the modal
  name: "TridentExample",
  sub: "one-line descriptor",
  icon: "🧪",                 // any emoji
  category: "gameplay",       // cosmetics | social | gameplay | infra
  scale: "12 classes",        // the credibility line under the card
  pitch: "What the server owner gets, in one sentence.",
  detail: ["A bullet.", "Another."],
  note: "Optional. Rendered as the highlighted callout.",
  commands: ["/example"]
}
```

Categories come from the `CATEGORIES` array at the bottom of the same file.
