/*
 * Every word on the site comes from this file. Edit here, save, refresh.
 * No build step, no dependencies.
 */

const SITE = {
  handle: "Kyoss",
  tagline: "Kyoss: Minecraft Server Development Services.",

  // The hero list. Add or cut lines freely — the layout adapts.
  servicesLabel: "Which includes:",
  services: [
    "Minecraft Plugin Development",
    "Minecraft Server Optimization",
    "Plugin Maintenance and Support"
  ],

  // ---- EDIT THESE ----
  discord: "kyoss",
  discordIcon: "assets/img/icons/Discord-Symbol-Blurple.svg",
  email: "Kyoush303@gmail.com",
  github: "https://github.com/Kyossss",
  // --------------------

  stats: [
    { n: "31", label: "plugins written" },
    { n: "938", label: "classes written" },
    { n: "3", label: "servers worked on" },
    { n: "26.1.2", label: "Paper, on Java 25" },
    { n: "0", label: "marketplace forks" }
  ]
};

/*
 * review.html — the client review form.
 *
 * Send a finished client this link, with their server name on the end:
 *   https://<your-pages-url>/review.html?server=Tokyo%20Core%20SMP
 * The page greets them by server, and the name is pre-filled for them.
 *
 * endpoint: the URL of YOUR Cloudflare Worker relay (relay/worker.js),
 * e.g. https://review-relay.<you>.workers.dev. Safe to publish: the real
 * Discord webhook lives only in the Worker's secret settings.
 * NEVER paste a raw discord.com/api/webhooks/... URL here: this is a public
 * repo, and anything in this file is readable by everyone forever.
 *
 * turnstileSiteKey: the Turnstile widget's SITE key (public, safe here).
 * Its SECRET key goes only into the Worker's secrets.
 *
 * Leave either empty and the page still works: it hands the client their
 * review as text to send you directly.
 */
const REVIEW = {
  endpoint: "",
  turnstileSiteKey: "",

  // The four things a client scores. Rename freely; the page adapts.
  criteria: [
    { id: "communication", name: "Communication", sub: "Kept you in the loop, answered clearly." },
    { id: "speed",         name: "Speed",         sub: "Delivered in the time it should have taken." },
    { id: "results",       name: "Results",       sub: "The work actually solved the problem." },
    { id: "value",         name: "Value",         sub: "Worth what you paid for it." }
  ],

  metricPlaceholder: "What was measured"
};

/*
 * category: see CATEGORIES at the bottom of this file
 * scale:    a one-line credibility signal
 * pitch:    what a server OWNER gets. No internals.
 * detail:   the bullets. Concrete, verifiable.
 * note:     optional standout fact or caveat.
 */
const PLUGINS = [
  /* ---------------- client work ---------------- */
  {
    id: "dicefish",
    name: "DiceFish",
    sub: "custom fishing · Dice SMP",
    icon: "\u{1F3A3}",
    category: "client",
    scale: "40 classes · client commission",
    pitch:
      "A full fishing economy for Dice SMP: rarities, measured catches, a fish market and leaderboards. It needs no other plugins.",
    detail: [
      "Rarities and fish are one YAML file each. Every catch has its own length, and its price is length × the rarity's multiplier, or a fixed price.",
      "It has its own fishing regions, drawn with a wand and shown as a particle outline. WorldGuard isn't needed, and each region can boost catches.",
      "Its own sell NPCs, built on Minecraft's Mannequin entity with a real skin, so Citizens is optional. NPCs are never saved into the world, so a crash can't duplicate them.",
      "Built to resist exploits. Fish are recognised by hidden tags, so a renamed item won't sell. Fish can't be crafted, cooked, placed or changed in an anvil, and an AFK farm drops back to vanilla catches after ten casts in one spot.",
      "The sell menu takes items out before it pays and returns anything unsold on close, quit or shutdown.",
      "Runs on SQLite or MySQL, supports Folia, and has a public API with cancellable catch and sell events."
    ],
    note:
      "Built to Dice SMP's spec, on Paper 1.21.11 and Java 21. A different stack from my own suite, which shows I work to whatever the client runs.",
    commands: ["/df sell", "/df sellall", "/df stats", "/df top", "/df region …", "/df npc …"]
  },

  /* ---------------- cosmetics ---------------- */
  {
    id: "skins",
    name: "TridentSkins",
    sub: "SkinForge skin engine",
    icon: "\u{1F455}",
    category: "cosmetics",
    scale: "26 classes · Java + Bedrock",
    pitch:
      "Offline-mode servers lose everyone's skin. This puts it back, on every server in the network.",
    detail: [
      "Premium players get their skin back automatically when they join. It uses Paper's own profile API, so ProtocolLib isn't needed.",
      "Three sources: a Mojang username lookup that backs off when rate-limited, any direct PNG URL, and Bedrock players through Floodgate.",
      "URL skins are signed through MineSkin, so Java clients show them instead of falling back to Steve.",
      "Stored in MySQL behind a TTL cache, plus an API jar with no dependencies for your other developers."
    ],
    note:
      "Written for offline mode, which is the hard case: there's no Mojang session to trust, so every skin has to be resolved and re-signed by hand.",
    commands: ["/trident skin set|url|clear|info"]
  },
  {
    id: "wardrobe",
    name: "TridentWardrobe",
    sub: "the dressing room",
    icon: "\u{1FA9E}",
    category: "cosmetics",
    scale: "25 classes · packet-only preview",
    pitch:
      "A physical dressing room in the hub. Players walk in, scroll through the skins they own, and walk out wearing one.",
    detail: [
      "A fixed camera and a scrolling carousel of the skins you own. The preview bodies are packets only, so no real entities are added to the world.",
      "The menu is drawn through TridentCanvas, so it keeps working for players running a shaderpack.",
      "Players upload their own skin from a book prompt. Uploads go through a Cloudflare Worker, so the upload link never shows the server's IP.",
      "Chat is held back inside the wardrobe, and leaving it can't reveal someone who is still inside.",
      "The plugin can also run the upload endpoint itself, or hand off to your own webapp."
    ],
    note:
      "Split out of TridentSkins, so the engine runs everywhere and the dressing room only runs where it's used.",
    commands: ["/wardrobe", "/wardrobe leave"]
  },
  {
    id: "camera",
    name: "TridentCameraAPI",
    sub: "third-person camera engine",
    icon: "\u{1F3A5}",
    category: "cosmetics",
    scale: "12 classes · packetevents",
    pitch:
      "A cinematic orbiting camera that flies out from the player and back again, with no snapping.",
    detail: [
      "A three-phase state machine (zoom out, orbit, zoom in), so going into and out of third person is a smooth move, not a cut.",
      "Runs entirely on packets. The player's real position is never touched, so nothing desyncs and no other plugin notices.",
      "Hides the player's held and worn items from every viewer while it runs, then restores them exactly. The inventory is never written to.",
      "Reads WASD, jump and shift while orbiting, on client versions 1.20 through 1.21.2+.",
      "Cancels itself the moment combat starts, and flies the camera home rather than dropping it.",
      "A fluent builder API and cancellable events, so your own plugins can drive it."
    ],
    note:
      "Deliberately standalone: it doesn't depend on my core, so it drops into any server.",
    commands: ["API-only · driven by other plugins"]
  },
  {
    id: "emotes",
    name: "TridentEmotes",
    sub: "3D animated emotes",
    icon: "\u{1F57A}",
    category: "cosmetics",
    scale: "43 classes · Model Engine 4",
    pitch:
      "Full-body animated emotes with a camera that pulls back to show them off. The avatar holds the gear you're actually wearing.",
    detail: [
      "Drives the camera engine and Model Engine together: it spawns the avatar, plays the animation, orbits the camera, and cleans everything up.",
      "Your real weapon and hat are put into the model's item bones, so the emote shows your actual sword, not a prop.",
      "An emote wheel of four favourites, drawn on the HUD through BetterHud. The plugin writes the wheel's HUD files itself.",
      "An emote library GUI with sort modes, per-player unlocks, and one ownership rule shared across the hub and every game.",
      "Taking damage stops the emote cleanly and hands the player back ready to fight.",
      "Falls back safely if Model Engine is missing, rather than throwing an error every time it's used."
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
    scale: "23 classes · Model Engine 4",
    pitch:
      "Model Engine pets that follow properly: no jittering, no getting stuck, no despawning.",
    detail: [
      "Each pet is a model on an invisible carrier mob with all of its vanilla AI removed, so it never wanders off or fights.",
      "The following is hand-written: it teleports when far away or in another world, paths to a point behind the owner, and stops when close.",
      "The carrier is an animal, so peaceful difficulty never removes it from under the model.",
      "Unlocked pets and the equipped one are saved in the database and survive restarts.",
      "A new pet is one YAML entry: model id, scale and interact animation."
    ],
    commands: ["/pet <id|off>", "/pet grant"]
  },
  {
    id: "avatars",
    name: "TridentAvatars",
    sub: "3D heads & resource pack",
    icon: "\u{1F5BC}️",
    category: "cosmetics",
    scale: "12 classes · built-in pack server",
    pitch:
      "A real 3D player head in your menus, and a flat portrait for your leaderboards, served from a resource pack that builds itself.",
    detail: [
      "Merges two vanilla-shader packs into one zip: Fancy Player Models for 3D heads in GUIs, and GUI Avatars for flat portraits.",
      "A built-in HTTP server delivers the pack, timed on join so Nexo's pack applies first and the overlapping files come out right.",
      "The pack is rebuilt only when its assets change, and the server warns at startup if the public URL players need is still set to localhost.",
      "Notices when a player's skin changes and refreshes their head, so portraits never go stale."
    ],
    commands: ["/profilereload [player]", "/tridentavatars reload"]
  },

  /* ---------------- social ---------------- */
  {
    id: "socials",
    name: "TridentSocials",
    sub: "friends & parties",
    icon: "\u{1F465}",
    category: "social",
    scale: "58 classes",
    pitch: "Friends and parties that survive a restart, with a party voice channel built in.",
    detail: [
      "Send and accept friend requests (if both players ask each other, it accepts automatically), with online indicators and join notifications.",
      "Friend requests arrive in the player's /inbox with working Accept buttons, even if they were offline.",
      "Parties hold up to six, are invite-only to existing friends, and have roles and a management GUI.",
      "Parties are saved: a restart no longer breaks up the group, and one command brings it back.",
      "Party PvP is off by default and the leader can turn it on.",
      "Simple Voice Chat integration gives each party its own voice channel.",
      "Every database call is async, caches load on join and clear on quit, and a public API with cancellable events lets your other plugins hook in."
    ],
    commands: ["/friend", "/f", "/party", "/p"]
  },
  {
    id: "trade",
    name: "TridentTrade",
    sub: "player-to-player trading",
    icon: "\u{1F91D}",
    category: "social",
    scale: "22 classes",
    pitch:
      "Face-to-face trading players can trust: items and money on the table, both sides confirm, and nothing can be swapped at the last second.",
    detail: [
      "A mirrored 54-slot window drawn from each player's own view: both see their own offer on the left and the other player's as a read-only copy.",
      "Items and money go on the same table. Coins are added in +10 / +100 / +1000 steps next to the goods.",
      "Any change to items, money or ready state during the countdown stops it and resets both sides, so nothing can be swapped after the other player confirms.",
      "You can't offer more money than you hold, and both balances are checked again before any money moves. A trade is cancelled rather than half-completed.",
      "Items stay in the trade window until it completes. If the trade is cancelled, someone disconnects or the server shuts down, every item goes back to its owner.",
      "Anything that won't fit in an inventory is dropped at the player's feet instead of being destroyed."
    ],
    note:
      "One trade per player at a time, in both directions: a request to someone already trading is refused, not queued.",
    commands: ["/trade <player>", "/trade accept", "/trade deny"]
  },
  {
    id: "chests",
    name: "TridentChests",
    sub: "friends & party chests",
    icon: "\u{1F9F0}",
    category: "social",
    scale: "24 classes",
    pitch:
      "Shared chests that open for your friends or your party, wherever they stand and whoever owns the land.",
    detail: [
      "A friends chest opens for everyone on the owner's friends list. A party chest opens for the owner's current party.",
      "Who can open a chest depends only on who you know, never on the land. Owning or being trusted on a claim gets you that claim's containers, not someone's friends chest standing on it.",
      "It tells the claims plugin to let a party member through even if they aren't trusted on that claim.",
      "Guild chests are already defined, ready for when a guild system exists, so storage won't need to change later."
    ],
    note:
      "A plugin of its own, so the land plugin never has to depend on the social plugin.",
    commands: ["/chests"]
  },
  {
    id: "display",
    name: "TridentDisplay",
    sub: "chat, nametags, tab & MOTD",
    icon: "\u{1F4AC}",
    category: "social",
    scale: "17 classes",
    pitch:
      "Chat, nametags, the tab list and the server-list MOTD, all taken from the player's rank, so no two of them can disagree.",
    detail: [
      "Chat is rendered for each viewer through Paper's own chat renderer, so other chat plugins keep working. Bedrock players see a plain prefix and Java players see the icon.",
      "Player messages are cleaned before they're shown, so nobody can sneak in a click event, a hover or formatting they don't have permission for.",
      "The nametag and the tab row come from the same scoreboard team, so tab is sorted by rank and the colours always match.",
      "Server-list MOTD, welcome, join and quit lines, with conditions.",
      "Chat, nametags and tab can each be turned on separately. If one fails it goes back to vanilla, and a broken template is logged once and shown as plain text."
    ],
    commands: ["/trident display (admin)"]
  },

  /* ---------------- gameplay ---------------- */
  {
    id: "lands",
    name: "TridentLands",
    sub: "chunk land claiming",
    icon: "\u{1F5FA}️",
    category: "gameplay",
    scale: "126 classes · the largest here",
    pitch:
      "A complete land-claim system: protection, flags, upkeep, upgrades, a land market and alliances.",
    detail: [
      "A claim is one chunk, and neighbouring claims join into a single territory with an owner, name, icon, tier and trust roles.",
      "Per-claim flags: PvP, mob spawning, fire spread, explosions, item pickup and villager trading.",
      "Tax and upkeep, claim upgrades and claim power, a marketplace for buying and selling land, alliances and achievements.",
      "Anti-grief logging, snapshots and backups, claim homes with a teleport delay, and particle borders.",
      "Dynmap and BlueMap integration, and English, German and Spanish translations.",
      "Runs on SQLite or MySQL, with versioned migrations."
    ],
    commands: ["/lands (~50 subcommands)", "/land"]
  },
  {
    id: "bounty",
    name: "TridentBounty",
    sub: "Wilderness bounty hunting",
    icon: "\u{1F3AF}",
    category: "gameplay",
    scale: "24 classes · BetterHud tracker",
    pitch:
      "Kill streaks make you wanted, players put prices on your head, and hunters track you across the Wilderness.",
    detail: [
      "Wanted stars ★1 to ★5 are earned through kill streaks, and each star has its own Wanted timer. Only time spent online in the Wilderness counts down, so nobody can hide their way clean.",
      "Contracts are paid by players, so the plugin never creates currency. Every coin it pays out was put in by a player.",
      "Heat: a share of every claimed contract sits on the claimer's own head until they survive 30 minutes.",
      "Bounty boards in the lobby give a HUD tracker. The higher the target's stars, the more accurate it is, from within 500 blocks at ★1 to exact at ★5.",
      "Killing the same player again within 30 minutes doesn't count, which stops two friends trading kills to farm the server's automatic contract.",
      "Admin actions that move money or change a player are written to the staff audit log."
    ],
    note: "Feature-complete, but not yet tested in game. The HUD art is still placeholder art.",
    commands: ["/bounty", "/bounty bank", "/pvp"]
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
      "No queue and no matchmaking, by design: you pick someone nearby from a GUI and they accept.",
      "A temporary barrier box goes up around the two players where they stand, and comes down when the duel ends.",
      "Requests expire on a timer and are answered from an accept/decline notification.",
      "The whole thing is one command, so there's nothing for players to learn."
    ],
    note:
      "Pairs with the Colosseum FFA arena in TridentHubGames, which is deliberately a different thing.",
    commands: ["/duel", "/1v1"]
  },
  {
    id: "hubgames",
    name: "TridentHubGames",
    sub: "Colosseum FFA & parkour",
    icon: "\u{1F3DF}️",
    category: "gameplay",
    scale: "41 classes",
    pitch:
      "The hub's own games: a free-for-all arena you draw with a wand, and parkour courses with timing.",
    detail: [
      "FFA arenas are drawn with a wand as a box or an oval, with an outline drawn from the resource pack.",
      "Kits for each arena, edited in game, and kill streaks shown on the player's nametag.",
      "A player's inventory and state are saved on the way in and restored exactly on the way out, however they leave. Changing worlds ends a session immediately.",
      "Parkour courses with checkpoints, triggers and per-player timing, saved to files with no database needed."
    ],
    note:
      "Renamed from TridentUtilities. Its permission nodes deliberately keep their old names, so every existing LuckPerms grant still works.",
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
      "Death drops nothing on the floor. It raises a grave holding your inventory, and once its protection runs out, others can try to break in.",
    detail: [
      "Your inventory and part of your XP go into a 3D grave model, with a hologram and a particle trail leading back to it.",
      "While protected, only the owner can open the grave. After that, other players can try to lockpick it, so recovering your items is a risk, not a guarantee.",
      "A take-only GUI with partial collection: grab what fits now and come back for the rest.",
      "When the timer ends, the grave plays a destruction animation and drops what's left.",
      "Saved to SQL and aware of unloaded chunks, so graves survive restarts."
    ],
    commands: ["/trident gravestone"]
  },
  {
    id: "ranks",
    name: "TridentRanks",
    sub: "ranks, titles & playtime",
    icon: "\u{1F3C5}",
    category: "gameplay",
    scale: "23 classes · PlaceholderAPI",
    pitch:
      "Ranks earned by playtime that actually means playing. AFK time doesn't count, and inactivity costs you the rank.",
    detail: [
      "Staff, playtime, top-holder and leaderboard rank types, each with a prefix, colour, weight and icon.",
      "Playtime only counts while the player is actually moving or looking around.",
      "Ranks decay after a period of inactivity. The GUI warns a player before they lose a rank, and admins can reset it.",
      "Titles and leaderboards, plus PlaceholderAPI placeholders you can rename.",
      "Updates merge new config keys in without wiping your changes, and player data is written in the background."
    ],
    commands: ["/titles", "/tranks set|remove|info"]
  },
  {
    id: "backpack",
    name: "TridentBackpack",
    sub: "paged, tiered storage",
    icon: "\u{1F392}",
    category: "gameplay",
    scale: "56 classes",
    pitch:
      "A backpack players grow over time. Pages and slots unlock separately, by rank or by currency.",
    detail: [
      "Two unlocks for each page: the page itself, and its tier from 9 to 45 slots. Buying a sixth page doesn't quietly hand over 45 slots in it.",
      "Unlocks can be free, rank-based or bought with currency, and every paid one asks for confirmation.",
      "Rank and currency names are checked at startup, so a typo is a warning, not a tier nobody can ever reach.",
      "Items are stored in a format that survives Minecraft version upgrades, and old saves are converted automatically.",
      "The backpack won't open until the player's data has loaded, so an empty screen can never be saved over a real backpack."
    ],
    commands: ["/backpack"]
  },

  /* ---------------- economy ---------------- */
  {
    id: "auctions",
    name: "TridentAuctions",
    sub: "auction house",
    icon: "\u{1F528}",
    category: "economy",
    scale: "28 classes · menu-only",
    pitch:
      "An auction house players never have to type a command for, built so a crash can neither duplicate an item nor lose one.",
    detail: [
      "Buy-now listings and timed auctions with bidding. Bid buttons for the minimum, +10% and +25%, and any spending click asks you to click again.",
      "Every purchase, cancellation and expiry is one database update, so only one click, on one server, can ever win a listing.",
      "When you're outbid, the refund is written in the same transaction as the new bid, so a crash can't leave anyone short.",
      "A bid in the last 30 seconds extends the auction, so there's no last-second sniping. Sellers who are offline are paid when they next log in.",
      "Listing limits follow your rank, there's a sale tax, and listing from creative mode is refused.",
      "Opens from the profile menu or the G key, with outbid and sold alerts in your inbox."
    ],
    note: "Written to replace AxAuctions, so the market looks and feels like the rest of the server's menus.",
    commands: ["/ah (optional — the menu is the interface)"]
  },
  {
    id: "showcase",
    name: "TridentShowcase",
    sub: "rotating shop displays",
    icon: "\u{1F6D2}",
    category: "economy",
    scale: "18 classes · Nexo",
    pitch:
      "Spinning item displays in the world. Click one to buy it.",
    detail: [
      "One catalogue item can be placed in many spots, each with its price and stock.",
      "Displays are recovered on restart instead of being duplicated, and stop spinning when no player is nearby.",
      "Purchases go through the server's economy, with a limit per purchase. Anything that won't fit is dropped at the player's feet.",
      "Still works, with fewer features, when Nexo or the core is missing."
    ],
    commands: ["/ts create|add|placed|menu"]
  },

  /* ---------------- hub & lobby ---------------- */
  {
    id: "hubutilities",
    name: "TridentHubUtilities",
    sub: "the network's front door",
    icon: "\u{1F9ED}",
    category: "hub",
    scale: "28 classes",
    pitch:
      "Everything the hub needs: a navigator, a game selector, clickable NPCs, and an inventory swap so nobody carries their survival gear into it.",
    detail: [
      "Your whole inventory, XP, health, hunger and effects are stored when you enter the hub and given back when you leave. The steps are ordered so a crash leads to no change or a row for staff to review, never a loss or a duplicate.",
      "A navigator, a game selector and a hub hotbar.",
      "Clickable Model Engine NPCs with glowing parts that hold their place and facing across restarts.",
      "Hub rules, including no-building and double-jump. The hub's time of day follows real-world time."
    ],
    commands: ["/hub", "/trident hubutilities (admin)"]
  },
  {
    id: "lobbyutilities",
    name: "TridentLobbyUtilities",
    sub: "a game's lobby",
    icon: "\u{1F6AA}",
    category: "hub",
    scale: "21 classes",
    pitch:
      "Lobby NPCs that drop you somewhere random the first time and back at your base every time after.",
    detail: [
      "Your first visit to a world puts you at a random safe spot: solid ground inside the border, not over liquid, and outside every land claim.",
      "Every later visit returns you to where you last stood, including in that world's Nether and End.",
      "The search loads chunks one at a time in the background and gives up after a set number of tries, so a seed that's mostly ocean can't leave a player stuck.",
      "Combat is checked when you click and again at the teleport, and a failed database read cancels the trip instead of scattering you somewhere new.",
      "Lobby rules, and double-jump with a sound."
    ],
    commands: ["/lobby", "/trident lobbyutilities (admin)"]
  },
  {
    id: "intro",
    name: "TridentIntroExtension",
    sub: "Typewriter first-join cinematic",
    icon: "\u{1F3AC}",
    category: "hub",
    scale: "17 files · Kotlin",
    pitch:
      "A first-join cinematic that waits on a title screen until the player presses a key.",
    detail: [
      "Typewriter can't pause a cinematic. This adds a Start Screen entry that tells it not to finish until the key arrives, with a BetterHud popup as the screen.",
      "The first-join flag is set only when the intro ends, so a player who quits halfway sees it again next time.",
      "Hide HUD, Fade and Cinematic Chrome entries for the presentation.",
      "In-game commands to capture camera path points."
    ],
    note:
      "A Typewriter extension rather than a Bukkit plugin: Kotlin and Gradle, kept separate from the Maven suite.",
    commands: ["/tw path add|undo|list <page>"]
  },

  /* ---------------- staff ---------------- */
  {
    id: "staff",
    name: "TridentStaff",
    sub: "moderation toolkit",
    icon: "\u{1F6E1}️",
    category: "staff",
    scale: "20 classes · audit-logged",
    pitch:
      "Vanish, staff mode, freeze and inventory inspection, with every action written to an audit log.",
    detail: [
      "Vanish, staff mode, freeze, invsee and endersee (editable at admin tier), tp, tphere, back, god, heal and whois.",
      "One staff tier ladder for the whole network, so a moderator is a moderator everywhere.",
      "Every staff action goes into an append-only audit log, which is kept forever unless you choose otherwise.",
      "Vanish was closed off everywhere a hidden staff member could still show up: nametags, suffixes, friends lists and party lists.",
      "Whois helps track alt accounts on an offline-mode server."
    ],
    note:
      "Kept separate from the admin console on purpose, so a bug in freeze can't take away staff's tools and the way to reach them at the same time.",
    commands: ["/trident staff …"]
  },
  {
    id: "admin",
    name: "TridentAdmin",
    sub: "admin console GUI",
    icon: "\u{1F39B}️",
    category: "staff",
    scale: "21 classes · 90 actions",
    pitch:
      "One GUI for every admin command across the network, so staff don't have to memorise them.",
    detail: [
      "90 admin actions across 20 modules, in one menu.",
      "Every action is limited by staff tier, and checked again when it's clicked.",
      "Destructive actions need a separate confirmation.",
      "Depends only on the core, so the console still opens when another module is missing."
    ],
    commands: ["/trident admin"]
  },

  /* ---------------- infrastructure ---------------- */
  {
    id: "core",
    name: "TridentCore",
    sub: "the shared foundation",
    icon: "⚙️",
    category: "infra",
    scale: "85 classes",
    pitch:
      "The one plugin every other one stands on, so nothing reaches into another plugin's code.",
    detail: [
      "A service registry, a pooled MySQL/MariaDB database and one /trident command router shared by every module.",
      "Economy support through CoinsEngine or ExcellentEconomy, with a fallback that does nothing and an automatic upgrade when one is installed.",
      "A notifications service with a chat fallback, so no plugin has to check whether TridentNotify is installed.",
      "Network identity: /hub, /lobby, transfers between servers, and which world counts as the hub on each server.",
      "The staff tier ladder and the audit log, so asking 'who did this' always has one answer."
    ],
    note: "This is why adding another plugin costs the same as adding the second one.",
    commands: ["/trident <module> …", "/hub", "/lobby"]
  },
  {
    id: "canvas",
    name: "TridentCanvas",
    sub: "menus that survive shaderpacks",
    icon: "\u{1F5B1}️",
    category: "infra",
    scale: "22 classes · custom GLSL",
    pitch:
      "Menus with a mouse cursor, drawn so they still work for players running Iris or OptiFine shaders.",
    detail: [
      "UI libraries that draw menus as entities in the world break under shaderpacks, which replace those shaders. Canvas draws in the GUI layer, which keeps its shaders.",
      "Each frame is one line of custom font characters, positioned onto a 1920×1080 canvas by a shader added inside BetterHud's.",
      "Turning your view moves the cursor and swinging your arm clicks, while the view stays still behind a see-through menu.",
      "Fades in and out, and other plugins use it through one service. The wardrobe is built on it."
    ],
    note:
      "Checked by running the shader in glslang and replaying the client's character placement: every corner lands within 0.0002 px at seven GUI scales.",
    commands: ["API-only · /trident canvas (test)"]
  },
  {
    id: "notify",
    name: "TridentNotify",
    sub: "notifications & inbox",
    icon: "\u{1F514}",
    category: "infra",
    scale: "22 classes",
    pitch:
      "Takes system messages out of chat and shows them as pop-ups, so chat goes back to being chat.",
    detail: [
      "A ladder of display methods (HUD toast, vanilla advancement, action bar, chat). Each one is asked whether it can reach this player, so a Bedrock player quietly falls through to the next.",
      "Drawn on a repositioned bossbar rather than floating text entities, so it survives shaderpacks and respawns.",
      "A saved inbox keeps important notifications, with working buttons, across restarts.",
      "Admins can send a whole category to toast, action bar, chat or off, and rewrite or turn off any single message in YAML.",
      "Waits while a player is on the login screen or has a menu open, then tries again. Bursts are merged into one."
    ],
    note:
      "Nothing has to depend on it. The core has a chat-only fallback and this replaces it, so a server without it keeps working.",
    commands: ["/inbox", "/notify (admin)"]
  },
  {
    id: "menu",
    name: "TridentMenu",
    sub: "YAML menu engine",
    icon: "\u{1F4CB}",
    category: "infra",
    scale: "27 classes",
    pitch:
      "Every menu on the server, written as YAML: pages, tabs, icons and actions, with no code.",
    detail: [
      "Six action types (open a plugin, run a command, change page, show a message, play a sound, close) cover almost every button.",
      "Items can require a permission, and are either hidden or refuse the click. The check runs again at click time.",
      "A broken item is skipped with a warning instead of the whole menu failing to load.",
      "Opens the profile menu from the advancements key, with a 3D head portrait."
    ],
    commands: ["/trident menu reload"]
  },
  {
    id: "combat",
    name: "CombatSystem",
    sub: "combat tagging API",
    icon: "\u{1FA78}",
    category: "infra",
    scale: "17 classes",
    pitch:
      "The combat-tag layer the rest of your server can ask. It hands out no punishments itself, just a reliable answer.",
    detail: [
      "Tags both players on PvP damage. Tagging on mob damage is a config option.",
      "More damage refreshes the timer instead of stacking it, and several sources with different durations never cut each other short.",
      "Fires cancellable events, so a safe-zone or arena plugin can block a tag outright.",
      "Detects combat logging and fires an event, so you decide what happens next.",
      "Can be turned off per world, with a bypass permission."
    ],
    note: "A library, not a feature. Its README doubles as the integration guide.",
    commands: ["/combat check|clear <player>"]
  },
  {
    id: "worlds",
    name: "TridentWorlds",
    sub: "per-world ore tuning",
    icon: "⛏️",
    category: "infra",
    scale: "6 classes",
    pitch:
      "More ore in the worlds that should have it. A resource-rich wilderness and a plain peaceful world can finally differ.",
    detail: [
      "TerraformGenerator has one ore table for every world. This adds a multiple of it, per world, with the same vein size and height ranges.",
      "Reads TerraformGenerator's config as YAML rather than using its code, so an upstream update can't break it.",
      "Loads before Multiverse, because a world it misses at creation generates plain with no error at all."
    ],
    note: "An add-on rather than a fork: no rebase every time TerraformGenerator ships a release.",
    commands: ["/trident worlds"]
  }
];

/*
 * Servers the work actually runs on.
 *
 * logo:   a file in assets/img/servers/. If the file is missing the card falls
 *         back to the server's name as text, so the page never looks broken.
 * tags:   short factual chips — platform, mode, scale. Keep them true.
 * review: the quote under the card. Set `pending: true` for a server that has
 *         not given one yet, and it renders greyed out instead of as a quote.
 */
const SERVERS = [
  {
    name: "Trident Legacy",
    logo: "assets/img/servers/trident-legacy.png",
    role: "Plugin developer",
    blurb:
      "My own network, launching soon: Paper 26.1.2 in offline mode, with a hub, per-game " +
      "lobbies and the Oasis SMP as its first game. All 29 Trident plugins on this page were " +
      "built for it, and every release goes through CI and is checked on the server after " +
      "deploying. Offline mode drove a lot of the work: with no Mojang session to trust, " +
      "skins, profiles and identity all had to be solved from scratch.",
    tags: ["Paper 26.1.2", "Offline mode", "29 plugins", "Pre-launch"],
    review: "My personal project server."
  },
  {
    name: "TokyoCore",
    logo: "assets/img/servers/tokyocore.png",
    role: "Server optimisation · 14-day contract",
    blurb:
      "Performance work on a live 80-player SMP, without a rebuild. I profiled it, found a " +
      "broken config that had silently undone 34 optimisations, and cut main-thread packet " +
      "handling from 24.56% to 11.42% and plugin listener time in half.",
    tags: ["Purpur / Leaf", "80 players", "Profiled with spark", "Delivered on time"],
    link: { href: "tokyocore.html", label: "What I did on TokyoCore →" }
  },
  {
    name: "Dice SMP",
    logo: "assets/img/servers/dice-smp.png",
    pixelLogo: true,   // the server's own 64x64 icon, from its MiniMOTD folder
    role: "Plugin developer · commission",
    blurb:
      "DiceFish, a custom fishing economy built to the server's spec: rarities, fishing " +
      "regions, sell NPCs, leaderboards and anti-exploit protection, on Paper 1.21.11 with " +
      "Folia support.",
    tags: ["Paper 1.21.11", "Folia-compatible", "Custom commission"],
    review: "Awaiting review",
    pending: true
  }
];

const CATEGORIES = [
  { id: "all", label: "Everything" },
  { id: "client", label: "Client work" },
  { id: "cosmetics", label: "Cosmetics" },
  { id: "social", label: "Social" },
  { id: "gameplay", label: "Gameplay" },
  { id: "economy", label: "Economy" },
  { id: "hub", label: "Hub & lobby" },
  { id: "staff", label: "Staff" },
  { id: "infra", label: "Infrastructure" }
];
