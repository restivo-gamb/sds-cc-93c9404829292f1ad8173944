#!/usr/bin/env node
/**
 * SDS Command Center — Weekly Snapshot Capture
 *
 * Reads the current SDS Command Center.html, extracts the JS data constants
 * (DATA, KPI, POD_KPIS, MBR_LIVE, OFFSITES) + innerHTML of hardcoded content
 * blocks, and writes a snapshot JSON keyed by ISO week.
 *
 * Also refreshes snapshots/index.json (the manifest that populates the
 * dropdown). Run by the sds-command-center-weekly-snapshot scheduled task
 * every Saturday 23:59 ET.
 *
 * Usage:
 *   node snapshots/capture.js                 # normal Saturday capture
 *   node snapshots/capture.js --week=2026-W16 # backfill a specific week
 *   node snapshots/capture.js --html=path.html --week=2026-W16  # read from alternate HTML (e.g., git show)
 *   node snapshots/capture.js --index-only    # only rebuild the manifest
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_HTML = path.join(ROOT, 'SDS Command Center.html');
const SNAPSHOTS_DIR = __dirname;

const FRAGMENT_IDS = [
    'snap-revenueHero', 'snap-wowForecast', 'snap-revGrid',
    'snap-efficiency', 'snap-scorecardIntro', 'snap-pipelineNote'
];

// --- Args ---
const args = Object.fromEntries(process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
}));

// --- ISO week helper (Mon-Sun, Thursday-anchored like ISO 8601) ---
function isoWeek(dateArg) {
    const d = new Date(Date.UTC(dateArg.getFullYear(), dateArg.getMonth(), dateArg.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNum };
}

function weekBounds(year, week) {
    // Monday of ISO week
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
    const monday = new Date(week1Monday);
    monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    return { monday, sunday };
}

function fmtDate(d) {
    return d.toISOString().slice(0, 10);
}

function fmtLabel(mon, sun) {
    const m = mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    const s = sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return `${m} – ${s}`;
}

function extractInnerHtmlById(html, id) {
    // Find <tag id="X" ...> ... </tag> — handle nested tags via a balanced walk.
    const openRe = new RegExp(`<([a-zA-Z][a-zA-Z0-9]*)[^>]*\\bid=["']${id}["'][^>]*>`, 'm');
    const openMatch = html.match(openRe);
    if (!openMatch) return null;
    const tag = openMatch[1];
    const start = openMatch.index + openMatch[0].length;
    // Walk forward balancing <tag ...> and </tag>
    const openTagRe = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
    const closeTagRe = new RegExp(`</${tag}\\s*>`, 'gi');
    openTagRe.lastIndex = start;
    closeTagRe.lastIndex = start;
    let depth = 1, cursor = start, end = -1;
    while (depth > 0) {
        openTagRe.lastIndex = cursor;
        closeTagRe.lastIndex = cursor;
        const nextOpen = openTagRe.exec(html);
        const nextClose = closeTagRe.exec(html);
        if (!nextClose) break;
        if (nextOpen && nextOpen.index < nextClose.index) {
            depth++;
            cursor = nextOpen.index + nextOpen[0].length;
        } else {
            depth--;
            if (depth === 0) {
                end = nextClose.index;
                break;
            }
            cursor = nextClose.index + nextClose[0].length;
        }
    }
    if (end < 0) return null;
    return html.slice(start, end);
}

function extractConstants(html) {
    // Extract the <script>...</script> block containing the constants
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
    if (!scriptMatch) throw new Error('Could not find main <script> block');
    const js = scriptMatch[1];

    // Evaluate in a sandbox VM. We only need the 5 top-level consts.
    // Strip anything after the constants to avoid running DOM code.
    // The render functions and init block reference `document` — we stub it.
    const sandbox = {
        document: new Proxy({}, { get: () => () => ({ getElementById: () => ({}), querySelectorAll: () => [], appendChild: () => {} }) }),
        window: {},
        console: { log: () => {}, error: () => {}, debug: () => {} },
        fetch: () => ({ then: () => ({ catch: () => {} }) }),
        Proxy,
        JSON,
        Math,
        Date,
        Object,
        Array
    };
    // Cheap approach: use regex to pull out each `const NAME = { ... };` or `const NAME = [ ... ];` block.
    const names = ['DATA', 'KPI', 'POD_KPIS', 'MBR_LIVE', 'OFFSITES'];
    const constants = {};
    for (const name of names) {
        // Find `const NAME = ` and then balance braces or brackets through the first matching close.
        const re = new RegExp(`const\\s+${name}\\s*=\\s*([\\{\\[])`);
        const m = js.match(re);
        if (!m) throw new Error(`Could not find const ${name} in HTML`);
        const openChar = m[1];
        const closeChar = openChar === '{' ? '}' : ']';
        let i = m.index + m[0].length; // positioned just after the opening brace/bracket
        let depth = 1;
        let inStr = null;
        let inLineComment = false;
        let inBlockComment = false;
        // We started after the opening — treat current position as depth 1 already,
        // then scan until depth returns to 0.
        while (i < js.length && depth > 0) {
            const ch = js[i];
            const next = js[i + 1];
            if (inLineComment) {
                if (ch === '\n') inLineComment = false;
            } else if (inBlockComment) {
                if (ch === '*' && next === '/') { inBlockComment = false; i++; }
            } else if (inStr) {
                if (ch === '\\') { i++; }
                else if (ch === inStr) { inStr = null; }
            } else if (ch === '/' && next === '/') { inLineComment = true; i++; }
            else if (ch === '/' && next === '*') { inBlockComment = true; i++; }
            else if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; }
            else if (ch === '{' || ch === '[') { depth++; }
            else if (ch === '}' || ch === ']') { depth--; if (depth === 0) break; }
            i++;
        }
        const literal = js.slice(m.index + m[0].length - 1, i + 1); // include opening + closing
        // Evaluate the literal in VM
        const ctx = vm.createContext({});
        try {
            constants[name] = vm.runInContext(`(${literal})`, ctx);
        } catch (e) {
            throw new Error(`Failed to eval const ${name}: ${e.message}`);
        }
    }
    return constants;
}

function captureSnapshot({ htmlPath, weekKey, capturedAt }) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const constants = extractConstants(html);
    const fragments = {};
    for (const id of FRAGMENT_IDS) {
        fragments[id] = extractInnerHtmlById(html, id) || '';
    }

    // Resolve week metadata
    let year, week;
    if (weekKey) {
        const m = weekKey.match(/^(\d{4})-W(\d{1,2})$/);
        if (!m) throw new Error(`Invalid --week format: ${weekKey} (expected 2026-W16)`);
        year = +m[1];
        week = +m[2];
    } else {
        const ref = capturedAt ? new Date(capturedAt) : new Date();
        ({ year, week } = isoWeek(ref));
    }
    const { monday, sunday } = weekBounds(year, week);
    const key = `${year}-W${String(week).padStart(2, '0')}`;

    const snapshot = {
        meta: {
            week: key,
            label: `Week of ${fmtLabel(monday, sunday)}`,
            weekStart: fmtDate(monday),
            weekEnd: fmtDate(sunday),
            capturedAt: capturedAt || new Date().toISOString(),
            sourceHtml: path.relative(ROOT, htmlPath)
        },
        constants,
        fragments
    };

    const outPath = path.join(SNAPSHOTS_DIR, `${key}.json`);
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
    return { key, outPath, snapshot };
}

function rebuildManifest() {
    const now = new Date();
    const { year, week } = isoWeek(now);
    const currentKey = `${year}-W${String(week).padStart(2, '0')}`;

    const files = fs.readdirSync(SNAPSHOTS_DIR)
        .filter(f => /^\d{4}-W\d{2}\.json$/.test(f))
        .sort((a, b) => b.localeCompare(a)); // newest first

    const snapshots = files
        .map(f => {
            const data = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, f), 'utf8'));
            return {
                week: data.meta.week,
                label: data.meta.label,
                weekStart: data.meta.weekStart,
                weekEnd: data.meta.weekEnd,
                capturedAt: data.meta.capturedAt
            };
        })
        // Exclude the current in-progress week from the historical dropdown —
        // it's always shown as "Current Week" and re-rendered live.
        .filter(s => s.week !== currentKey);

    const { monday, sunday } = weekBounds(year, week);

    const manifest = {
        updatedAt: now.toISOString(),
        currentWeek: currentKey,
        currentLabel: fmtLabel(monday, sunday),
        snapshots
    };
    fs.writeFileSync(path.join(SNAPSHOTS_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
    return manifest;
}

// --- Main ---
try {
    if (!args['index-only']) {
        const htmlPath = args.html ? path.resolve(args.html) : DEFAULT_HTML;
        const result = captureSnapshot({
            htmlPath,
            weekKey: args.week,
            capturedAt: args['captured-at']
        });
        console.log(`Captured ${result.key} → ${path.relative(ROOT, result.outPath)}`);
    }
    const manifest = rebuildManifest();
    console.log(`Manifest updated: ${manifest.snapshots.length} snapshot(s) — current week ${manifest.currentWeek}`);
} catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
}
