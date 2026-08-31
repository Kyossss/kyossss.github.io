# Plugin portfolio

A static portfolio of the twelve Trident plugins I authored, aimed at Minecraft server
owners. Plain HTML, CSS and JavaScript — no build step, no dependencies, no Node.
Open `index.html` in a browser and it works.

```
Portfolio/
├── index.html              the page structure
├── .nojekyll               stops GitHub Pages running Jekyll over it
└── assets/
    ├── css/style.css       the whole stylesheet; design tokens at the top
    ├── js/data.js          ← EDIT THIS. Every word on the site.
    ├── js/main.js          behaviour: filters, modal. You should not need to touch it.
    └── img/favicon.svg
```

## The only file you need to edit

**`assets/js/data.js`.** The intro, the stat tiles, the contact details, and all twelve
plugin entries live there as plain objects. Change a value, save, refresh.

### Contact details

Set in `SITE`: Discord `kyoss`, email `Kyoush303@gmail.com`, GitHub
`https://github.com/Kyossss` — confirm the GitHub username is right before publishing.

A contact entry with no value is simply not rendered, so deleting one is safe.

## What is on it, and what is not

Twelve plugins: **TridentSkins, TridentCameraAPI, TridentEmotes, TridentPets,
TridentSocials, TridentTrade, TridentDuels, TridentUtilities, TridentGravestone,
TridentShowcase, TridentNotify, CombatSystem.**

Deliberately excluded: **TridentCore, Lands, Ranks, Menu, Backpack, Avatars, Chests** —
majority-authored by M0rk. The "How I work" section still refers to the shared
architecture, because that is the context these twelve run in, but it claims none of those
plugins as mine.

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
