/*
 * Every word on the site comes from this file. Edit here, save, refresh.
 * No build step, no dependencies.
 */

const SITE = {
  handle: "Kyoss",
  tagline: "Custom Minecraft plugins for servers that outgrew the marketplace.",
  intro:
    "I build bespoke Paper plugins — the systems a server needs when the public offering " +
    "stops fitting. Everything below runs in production on a live network, not on a test box. " +
    "Twelve plugins, ~267 classes, one shared architecture.",

  // ---- EDIT THESE ----
  discord: "kyoss",
  email: "Kyoush303@gmail.com",
  github: "https://github.com/Kyossss",
  // --------------------

  stats: [
    { n: "12", label: "plugins in production" },
    { n: "267", label: "classes written" },
    { n: "26.1.2", label: "Paper, on Java 25" },
    { n: "0", label: "marketplace forks" }
  ]
};

/*
 * category: cosmetics | social | gameplay | infra
 * scale:    a one-line credibility signal
 * pitch:    what a server OWNER gets. No internals.
 * detail:   the bullets. Concrete, verifiable.
 * note:     optional standout fact or caveat.
 */
const PLUGINS = [
  {
    id: "skins",
    name: "TridentSkins",
    sub: "SkinForge",
    icon: "\u{1F455}",
    category: "cosmetics",
    scale: "44 classes · Java + Bedrock",
    pitch:
      "Offline-mode servers lose everyone's skin. This gives it back — and adds a wardrobe players actually walk into.",
    detail: [
      "Skins restore automatically on join for premium players, through Paper's native profile API — no ProtocolLib.",
      "Three sources: Mojang username lookup with rate-limit backoff, any direct PNG URL, and Bedrock players through Floodgate.",
      "URL skins are signed through MineSkin so Java clients render them instead of falling back to Steve.",
      "A physical dressing room: fixed camera, a scrolling carousel of your owned skins, and preview bodies drawn as packets only — no real entities in the world.",
      "Players upload their own skin from a book prompt. The plugin can run the upload endpoint itself or hand off to your webapp.",
      "MySQL-backed behind a TTL cache, plus a dependency-free API jar for your other developers."
    ],
    note:
      "Written for offline-mode, which is the hard case — there is no Mojang session to trust, so every skin has to be resolved and re-signed by hand.",
    commands: ["/wardrobe", "/trident skin set|url|clear|info"]
  },
  {
    id: "camera",
    name: "TridentCameraAPI",
    sub: "third-person camera engine",
    icon: "\u{1F3A5}",
    category: "cosmetics",
    scale: "13 classes · packetevents",
    pitch:
      "A cinematic orbital camera that flies out from the player and back again, with no snapping.",
    detail: [
      "Three-phase state machine — zoom out, orbit, zoom in — so entering and leaving third person is a smooth move, not a cut.",
      "Runs entirely on packets. The player's real position is never touched, so nothing desyncs and no other plugin notices.",
      "Hides the player's held and worn items from every viewer for the duration, then restores them exactly. The inventory is never written to.",
      "Reads WASD, jump and shift while orbiting, across client versions 1.20 through 1.21.2+.",
      "Cancels itself the moment combat starts, and flies the camera home rather than dropping it.",
      "Fluent builder API and cancellable events, so your own plugins can drive it."
    ],
    note:
      "Deliberately standalone — the one plugin here with no dependency on my own core, so it drops into any server.",
    commands: ["API-only · driven by other plugins"]
  },
  {
    id: "emotes",
    name: "TridentEmotes",
    sub: "3D animated emotes",
    icon: "\u{1F57A}",
    category: "cosmetics",
    scale: "22 classes · Model Engine 4",
    pitch:
      "Full-body animated emotes with a camera that pulls back to show them off — and the avatar holds the gear you are actually wearing.",
    detail: [
      "Drives the camera engine and Model Engine together: spawns the avatar, plays the animation, orbits the camera, cleans it all up.",
      "Live weapons and hats are fed into the model's item bones, so the emote shows your real sword, not a prop.",
      "Emote library GUI with sort modes, per-player unlocks, and a loadout system with slot protection.",
      "Taking damage aborts the emote cleanly and hands the player back combat-ready.",
      "Degrades to a safe fallback if Model Engine is missing, rather than erroring on every use."
    ],
    note: "Ships with a Blockbench modelling guide, so your artist can add emotes without me.",
    commands: ["/emote", "/emotes", "/e"]
  },
  {
    id: "pets",
    name: "TridentPets",
    sub: "cosmetic followers",
    icon: "\u{1F43E}",
    category: "cosmetics",
    scale: "9 classes · Model Engine 4",
    pitch:
      "Model-Engine pets that follow properly — no jittering, no getting stuck, no despawning.",
    detail: [
      "Each pet is a model on an invisible carrier mob with every vanilla AI goal stripped off, so it never wanders or fights.",
      "Following is hand-written: teleport when far or in another world, path to a point behind the owner, stop when close.",
      "The carrier is an animal, so peaceful difficulty never culls it out from under the model.",
      "Unlocks and the equipped pet persist in the database and survive restarts.",
      "A new pet is one YAML entry — model id, scale, interact animation."
    ],
    commands: ["/pet <id|off>", "/pet grant"]
  },
  {
    id: "socials",
    name: "TridentSocials",
    sub: "friends & parties",
    icon: "\u{1F465}",
    category: "social",
    scale: "47 classes · the largest here",
    pitch: "Friends and parties that survive a restart, with a party voice channel built in.",
    detail: [
      "Request and accept flow with mutual-request auto-accept, online indicators, and join notifications.",
      "Parties capped at six, invite-only to existing friends, with roles and a manage GUI.",
      "Parties are persisted — a restart no longer costs you the group, and one command rebuilds it.",
      "Leader-toggled party PvP, off by default.",
      "Simple Voice Chat integration gives each party its own voice channel.",
      "Every database call is async; caches warm on join and clear on quit.",
      "Public API with cancellable events for your other plugins to hook."
    ],
    commands: ["/friend", "/f", "/party", "/p"]
  },
  {
    id: "trade",
    name: "TridentTrade",
    sub: "player-to-player trading",
    icon: "🤝",
    category: "social",
    scale: "10 classes",
    pitch:
      "Face-to-face trading players can trust: items and money on the table, both sides confirm, and nothing can be swapped at the last second.",
    detail: [
      "A mirrored 54-slot window drawn from each player's own point of view, so both see their offer on the left and the other's as a read-only copy.",
      "Items and money on the same table — stage coins in +10 / +100 / +1000 steps alongside the goods.",
      "Any change to items, money or ready state during the countdown aborts it and resets both sides. That is the anti-swap protection: nothing is quietly substituted after the other player has confirmed.",
      "You can never stage more money than you hold, and balances are re-verified before any money moves — a trade aborts rather than half-completing.",
      "Items live in staging until completion. On cancel, a disconnect, or a server shutdown, every staged item goes back to its owner.",
      "Delivery is give-or-drop: anything that will not fit lands at the player's feet instead of being destroyed."
    ],
    note:
      "One session per player, enforced both ways — a request to someone already trading is refused rather than queued.",
    commands: ["/trade <player>", "/trade accept", "/trade deny"]
  },
  {
    id: "duels",
    name: "TridentDuels",
    sub: "consensual 1v1",
    icon: "⚔️",
    category: "gameplay",
    scale: "17 classes",
    pitch:
      "Duel the person standing in front of you. The arena is built around you both, then taken away.",
    detail: [
      "No queue and no matchmaking, by design — you pick someone within range from a GUI and they accept.",
      "A temporary barrier box is raised around the pair where they stand, and removed when the duel ends.",
      "Requests expire on a timer and are answered from an accept/decline notification.",
      "The whole surface is one command — nothing for players to learn."
    ],
    note:
      "Pairs with the open-world FFA regions in TridentUtilities, which are a deliberately different thing.",
    commands: ["/duel", "/1v1"]
  },
  {
    id: "utilities",
    name: "TridentUtilities",
    sub: "FFA regions & parkour",
    icon: "\u{1F6E0}️",
    category: "gameplay",
    scale: "33 classes",
    pitch:
      "Two lobby systems in one jar: FFA arenas you draw with a wand, and hub parkour with timing.",
    detail: [
      "FFA — cuboid PvP zones selected with a wand, per-region kits with an in-game editor, and kill streaks.",
      "A player's inventory and state are saved on entry and restored exactly on exit, however they leave.",
      "Parkour — courses with checkpoints and region triggers, and per-player timing.",
      "Courses are flat-file, so no database is needed to run them."
    ],
    note:
      "The two share no code on purpose, so splitting them into separate plugins later is a move, not an untangle.",
    commands: ["/trident duelregion", "/trident parkour"]
  },
  {
    id: "gravestone",
    name: "TridentGravestone",
    sub: "death chests",
    icon: "\u{1FAA6}",
    category: "gameplay",
    scale: "17 classes · Model Engine 4",
    pitch:
      "Death drops nothing on the floor. It raises a grave holding your inventory — and others can try to crack it.",
    detail: [
      "Inventory and part of the XP go into a 3D grave model with a hologram and a particle trail leading back to it.",
      "The grave decays through two phases on configurable timers, then plays a destruction animation and releases the contents.",
      "Other players can lockpick a grave that is not theirs — risk, not a guaranteed recovery.",
      "Persisted to SQL and chunk-aware, so graves survive restarts and unloaded chunks."
    ],
    commands: ["/trident gravestone"]
  },
  {
    id: "showcase",
    name: "TridentShowcase",
    sub: "in-world shops",
    icon: "\u{1F6D2}",
    category: "gameplay",
    scale: "18 classes",
    pitch: "Rotating item displays you place in the world, wired to a real purchase flow.",
    detail: [
      "One catalog entry — id, item, price, stock — can back any number of physical placements.",
      "Each display is an invisible floating stand, tagged so it is recovered on boot rather than duplicated.",
      "Rotation skips unloaded chunks and any display with no player nearby, so idle shops cost nothing.",
      "Purchases charge through the shared economy, with a per-purchase quantity cap.",
      "Degrades rather than failing when its optional dependencies are absent."
    ],
    commands: ["/ts", "/tridentshowcase"]
  },
  {
    id: "notify",
    name: "TridentNotify",
    sub: "notifications & inbox",
    icon: "\u{1F514}",
    category: "infra",
    scale: "22 classes",
    pitch:
      "Takes system messages out of chat and puts them in a toast, so chat goes back to being chat.",
    detail: [
      "A ladder of renderers — HUD toast, vanilla advancement, action bar, chat — each asked whether it can reach this specific player, so a Bedrock client falls through silently.",
      "Drawn as a repositioned bossbar rather than floating text entities, so it survives shaderpacks and respawns.",
      "A persistent inbox keeps important notifications, with working buttons, across restarts.",
      "Admins route a whole category to toast, action bar, chat or off, and can rewrite or disable any individual message from YAML.",
      "Held back while a player is on the login screen or has a menu open, then retried. Bursts are coalesced."
    ],
    note:
      "Nothing has to depend on it. The core registers a chat-only fallback and this swaps itself in over the top, so a server without it keeps working.",
    commands: ["/inbox", "/notify (admin)"]
  },
  {
    id: "combat",
    name: "CombatSystem",
    sub: "combat tagging API",
    icon: "\u{1FA78}",
    category: "infra",
    scale: "15 classes",
    pitch:
      "The combat-tag layer the rest of your server can ask. No punishments of its own — just a reliable answer.",
    detail: [
      "Tags both players on PvP damage. PvE tagging is a config toggle.",
      "Further damage refreshes the timer rather than stacking it, and multiple sources with different durations coexist without shortening each other.",
      "Fires cancellable events, so a safe-zone or arena plugin can veto a tag outright.",
      "Detects combat logging and fires an event for whatever you want to do about it.",
      "Per-world disable and a bypass permission."
    ],
    note: "A library, not a feature. Its README doubles as the integration guide.",
    commands: ["/combat check|clear <player>"]
  }
];

const CATEGORIES = [
  { id: "all", label: "Everything" },
  { id: "cosmetics", label: "Cosmetics" },
  { id: "social", label: "Social" },
  { id: "gameplay", label: "Gameplay" },
  { id: "infra", label: "Infrastructure" }
];
