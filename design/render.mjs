// Renders the profile header and project cards to PNG (dark + light) with headless Chromium.
// Usage: node design/render.mjs   (writes assets/*.png)
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const build = join(root, "design", "build");
const out = join(root, "assets");
mkdirSync(build, { recursive: true });
mkdirSync(out, { recursive: true });

// GitHub's own canvas colours, so the images sit on the page like native UI.
const T = {
  dark: {
    text: "#F0F6FC", muted: "#9198A1", faint: "#656C76",
    card: "#151B23", border: "#3D444D", inset: "#0D1117",
    tileA: "#1E2330", tileStroke: "#3A4152", ink: "#E6E8EE", hole: "#151B23",
  },
  light: {
    text: "#1F2328", muted: "#59636E", faint: "#818B98",
    card: "#F6F8FA", border: "#D1D9E0", inset: "#FFFFFF",
    tileA: "#E6EAEF", tileStroke: "#C5CDD6", ink: "#2B3140", hole: "#F6F8FA",
  },
};

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&family=JetBrains+Mono:wght@400;500&display=block" rel="stylesheet">`;

const base = (w, h, css, body) => `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;background:transparent;overflow:hidden}
body{font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased;font-feature-settings:"cv11","ss01"}
.mono{font-family:"JetBrains Mono",monospace}
${css}</style></head><body>${body}</body></html>`;

// ---------- icons (lifted from each repo's wordmark so the profile matches the projects) ----------
const icons = {
  theme: (c) => `<svg width="132" height="84" viewBox="0 0 132 84">
    <defs><linearGradient id="ts" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38BDF8"/><stop offset="1" stop-color="#10E0A0"/></linearGradient></defs>
    <rect x="44" y="2" width="70" height="50" rx="9" fill="${c.tileA}" stroke="${c.tileStroke}" stroke-width="2" transform="rotate(9 79 27)"/>
    <rect x="28" y="10" width="70" height="50" rx="9" fill="${c.tileA}" stroke="${c.tileStroke}" stroke-width="2" transform="rotate(4 63 35)"/>
    <rect x="8" y="22" width="76" height="54" rx="10" fill="url(#ts)"/>
    <g fill="#0D1117" fill-opacity="0.55"><circle cx="22" cy="64" r="4"/><circle cx="34" cy="64" r="4"/><circle cx="46" cy="64" r="4"/></g>
    <rect x="18" y="32" width="34" height="5" rx="2.5" fill="#0D1117" fill-opacity="0.45"/>
  </svg>`,
  lock: (c) => `<svg width="132" height="84" viewBox="-4 -2 104 88">
    <g fill="${c.ink}" opacity="0.95"><rect x="24" y="0" width="8" height="8"/><rect x="32" y="0" width="8" height="8"/><rect x="40" y="0" width="8" height="8"/><rect x="48" y="0" width="8" height="8"/><rect x="16" y="8" width="8" height="8"/><rect x="56" y="8" width="8" height="8"/><rect x="16" y="16" width="8" height="8"/><rect x="56" y="16" width="8" height="8"/><rect x="16" y="24" width="8" height="8"/><rect x="56" y="24" width="8" height="8"/></g>
    <g fill="#7AA2F7"><rect x="8" y="32" width="64" height="48"/></g>
    <g fill="${c.hole}"><rect x="36" y="44" width="8" height="24"/></g>
    <g fill="#7AA2F7" opacity="0.35"><rect x="80" y="40" width="8" height="8"/><rect x="88" y="48" width="8" height="8"/><rect x="0" y="48" width="8" height="8"/></g>
  </svg>`,
  tiles: (c) => `<svg width="132" height="84" viewBox="-10 -4 156 104">
    <defs><linearGradient id="tt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7AA2F7"/><stop offset="1" stop-color="#BB9AF7"/></linearGradient></defs>
    <rect x="0" y="0" width="52" height="70" rx="8" fill="${c.tileA}" stroke="${c.tileStroke}" stroke-width="2"/>
    <rect x="66" y="0" width="52" height="70" rx="8" fill="url(#tt)" opacity="0.95"/>
    <path d="M-6 92 C 20 92, 28 18, 46 18 S 72 44, 90 36 S 118 20, 140 24" fill="none" stroke="#7AA2F7" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="140" cy="24" r="3.5" fill="#BB9AF7"/>
  </svg>`,
  softly: () => `<svg width="190" height="84" viewBox="-6 -20 166 74">
    <defs>
      <linearGradient id="sf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E2330"/><stop offset="0.5" stop-color="#12151C"/><stop offset="1" stop-color="#0E1016"/></linearGradient>
      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4C8DFF" stop-opacity="0"/><stop offset="0.5" stop-color="#4C8DFF" stop-opacity="0.75"/><stop offset="1" stop-color="#4C8DFF" stop-opacity="0"/></linearGradient>
    </defs>
    <rect x="-1" y="-1" width="155" height="34.3" rx="17.2" fill="#000" fill-opacity="0.35"/>
    <rect x="0" y="0" width="153" height="33" rx="16.5" fill="#2A3040"/>
    <rect x="0" y="1" width="153" height="30.3" rx="15.2" fill="url(#sf)"/>
    <rect x="5.25" y="5.15" width="107" height="22" rx="11" fill="#06080C"/>
    <rect x="5.25" y="6.4" width="107" height="19.75" rx="9.9" fill="url(#sg)"/>
    <g fill="#E6E8EE"><rect x="13.25" y="13" width="2.5" height="6" rx="1.25"/><rect x="18.17" y="11" width="2.5" height="10" rx="1.25"/><rect x="23.08" y="9" width="2.5" height="14" rx="1.25"/><rect x="28" y="11.5" width="2.5" height="9" rx="1.25"/><rect x="32.92" y="8" width="2.5" height="16" rx="1.25"/><rect x="37.83" y="12" width="2.5" height="8" rx="1.25"/><rect x="42.75" y="9.5" width="2.5" height="13" rx="1.25"/><rect x="47.67" y="7" width="2.5" height="18" rx="1.25"/><rect x="52.58" y="10" width="2.5" height="12" rx="1.25"/><rect x="57.5" y="7.5" width="2.5" height="17" rx="1.25"/><rect x="62.42" y="11" width="2.5" height="10" rx="1.25"/><rect x="67.33" y="9" width="2.5" height="14" rx="1.25"/><rect x="72.25" y="12.5" width="2.5" height="7" rx="1.25"/><rect x="77.17" y="10" width="2.5" height="12" rx="1.25"/><rect x="82.08" y="13" width="2.5" height="6" rx="1.25"/><rect x="87" y="11" width="2.5" height="10" rx="1.25"/><rect x="91.92" y="13.5" width="2.5" height="5" rx="1.25"/><rect x="96.83" y="12" width="2.5" height="8" rx="1.25"/><rect x="101.75" y="14" width="2.5" height="4" rx="1.25"/></g>
    <text x="132.5" y="21" text-anchor="middle" font-family="Inter" font-size="11" font-weight="500" fill="#E6E8EE" fill-opacity="0.76">0:04</text>
  </svg>`,
};

// ---------- project cards (color blocks: art panel on top, project color below) ----------
const projects = [
  { id: "theme-studio", icon: "theme", block: "#22D3B4", ink: "#04211C", body: "#0A3B33", name: "Theme Studio",
    line: "Every Omarchy theme, one click from the bar." },
  { id: "hello-lock", icon: "lock", block: "#7AA2F7", ink: "#0B1630", body: "#14244A", name: "Hello Lock",
    line: "A lock screen that greets you, with eleven power-on animations." },
  { id: "tricky-tiles", icon: "tiles", block: "#BB9AF7", ink: "#1E1036", body: "#2E1B4F", name: "Tricky Tiles",
    line: "Spring physics for window and workspace switches." },
  { id: "softly", icon: "softly", block: "#4C8DFF", ink: "#061634", body: "#0B2250", name: "Softly",
    line: "Tap a key, speak, tap again. Local Whisper dictation." },
];

// Art panel tones per mode; the colour block is the same in both.
const ART = {
  dark: { panel: "#161B22", tileA: "#21262D", tileStroke: "#30363D", ink: "#E6E8EE" },
  light: { panel: "#EEF1F5", tileA: "#DDE2E9", tileStroke: "#C5CDD6", ink: "#2B3140" },
};

const CW = 208, CH = 326;
const cardHtml = (p, mode) => {
  const a = ART[mode];
  const ic = { ...a, hole: a.panel };
  return base(CW, CH, `
.card{position:absolute;inset:0;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.art{height:170px;background:${a.panel};display:flex;align-items:center;justify-content:center}
.art svg{${p.icon === "softly" ? "width:176px;height:auto" : "width:auto;height:72px"}}
.block{flex:1;background:${p.block};padding:20px 18px 18px;display:flex;flex-direction:column;gap:8px}
h2{font-size:20px;font-weight:700;letter-spacing:-0.4px;color:${p.ink}}
p{font-size:14px;line-height:20px;color:${p.body};flex:1}
.cta{font-size:13px;font-weight:600;color:${p.ink}}
`, `<div class="card"><div class="art">${icons[p.icon](ic)}</div>
  <div class="block"><h2>${p.name}</h2><p>${p.line}</p><span class="cta">View repo →</span></div></div>`);
};

// ---------- header ----------
const HW = 880, HH = 200;
const headerHtml = (c) => base(HW, HH, `
.wrap{position:absolute;inset:0}
h1{position:absolute;left:2px;top:30px;font-size:58px;font-weight:750;letter-spacing:-2.4px;color:${c.text};line-height:1}
.tag{position:absolute;left:4px;top:106px;font-size:20px;color:${c.muted};letter-spacing:-0.2px}
.meta{position:absolute;left:4px;top:150px;font-size:13px;color:${c.faint};letter-spacing:0.2px}
.meta b{font-weight:500;color:${c.muted}}
svg.curve{position:absolute;right:0;top:0}
`, `<div class="wrap">
  <svg class="curve" width="300" height="200" viewBox="0 0 300 200">
    <defs><linearGradient id="hc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7AA2F7" stop-opacity="0"/><stop offset="0.35" stop-color="#7AA2F7"/><stop offset="1" stop-color="#BB9AF7"/></linearGradient></defs>
    <path d="M10 168 C 90 168, 110 52, 160 52 S 210 98, 240 86 S 274 66, 290 70" fill="none" stroke="url(#hc)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="290" cy="70" r="4.5" fill="#BB9AF7"/>
  </svg>
  <h1>DeNon Maryland</h1>
  <div class="tag">I build quiet, carefully finished software for the desktop.</div>
  <div class="meta mono"><b>Omarchy plugins</b> · macOS &amp; Windows apps · local-first</div>
</div>`);

// ---------- render ----------
const chromium = process.env.CHROMIUM || "chromium";
function shot(name, html, w, h) {
  const file = join(build, `${name}.html`);
  writeFileSync(file, html);
  execFileSync(chromium, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
    `--user-data-dir=${join(build, ".chrome")}`,
    "--force-device-scale-factor=2", `--window-size=${w},${h}`,
    "--default-background-color=00000000", "--virtual-time-budget=4000",
    `--screenshot=${join(out, `${name}.png`)}`, `file://${file}`,
  ], { stdio: "ignore" });
  console.log("wrote", `assets/${name}.png`);
}

for (const mode of ["dark", "light"]) {
  shot(`header-${mode}`, headerHtml(T[mode]), HW, HH);
  for (const p of projects) shot(`${p.id}-${mode}`, cardHtml(p, mode), CW, CH);
}
