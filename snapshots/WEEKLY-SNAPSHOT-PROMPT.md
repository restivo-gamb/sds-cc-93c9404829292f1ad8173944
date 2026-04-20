Weekly snapshot capture for Matt Restivo's SDS Command Center dashboard.

## Context

Matt (SVP/GM of Sports Data Services at GAMB) uses a single-file HTML dashboard at `/Users/Matt/Documents/Claude/Projects/SDS Dashboard/SDS Command Center.html` as his daily triage tool. The sibling `index.html` is a mirror served by GitHub Pages at an unguessable slug URL. A separate daily task (`sds-command-center-daily-refresh`) updates the live dashboard each morning at 5:30 AM. This Saturday 11:59 PM task closes out the completed Mon–Sun ISO week by writing a JSON snapshot so Matt can later compare week-over-week via a dropdown in the dashboard header.

The dashboard is powered by five JS data constants (`DATA`, `KPI`, `POD_KPIS`, `MBR_LIVE`, `OFFSITES`) near the bottom of the HTML, plus six hardcoded-HTML blocks tagged with IDs: `snap-revenueHero`, `snap-wowForecast`, `snap-revGrid`, `snap-efficiency`, `snap-scorecardIntro`, `snap-pipelineNote`. A Node.js script (`snapshots/capture.js`) already exists in the same folder to extract all of this into a snapshot JSON.

## What to do

**Step 1 — Capture the snapshot.** `cd` into the dashboard folder and run the capture script against the live HTML:

```
cd "/Users/Matt/Documents/Claude/Projects/SDS Dashboard"
node snapshots/capture.js
```

The script derives the ISO week from today's date (Saturday), writes `snapshots/<YYYY>-W<NN>.json`, and rebuilds `snapshots/index.json` (the manifest that drives the week picker dropdown). The current in-progress week is intentionally excluded from the manifest.

**Step 2 — If the capture script errors, inspect and fix.** Common causes:
- A constant name renamed in the HTML → update the `names` array in `capture.js`.
- A new fragment ID added → update `FRAGMENT_IDS` in both `capture.js` AND the `SNAPSHOT_FRAGMENT_IDS` array inside the HTML.
- Syntax error in the captured JS literal → re-run with `--week=YYYY-WNN` after fixing.

**Step 3 — Git commit and push:**

```
cd "/Users/Matt/Documents/Claude/Projects/SDS Dashboard"
rm -f .git/*.lock
git add snapshots/
git commit -m "Weekly snapshot $(date +%Y-W%V)"
git push
```

If `.git/index.lock` or `.git/HEAD.lock` persists after `rm`, log the issue in step 5 — Matt will clear and push manually. Never force-push.

**Step 4 — Verify the snapshot is valid.**

```
node -e "const s = JSON.parse(require('fs').readFileSync('snapshots/'+require('fs').readdirSync('snapshots').filter(f=>/^\d{4}-W\d{2}\.json$/.test(f)).sort().pop())); console.log('Week:', s.meta.week, 'RW:', s.constants.DATA.rw, 'Attention count:', s.constants.DATA.attention.length, 'Fragments:', Object.keys(s.fragments).filter(k=>s.fragments[k]).length+'/6');"
```

Expect: week label matches the closing Saturday's ISO week, `DATA.rw` has numeric forecast/budget fields, attention array is non-empty, 6/6 fragments populated.

**Step 5 — Append to `/Users/Matt/Documents/Claude/Projects/SDS Dashboard/daily-refresh-log.md`:**

```
## YYYY-MM-DD — Weekly snapshot

- Captured snapshot 2026-W<NN> (Week of <Mon-Date> – <Sun-Date>) → snapshots/2026-WNN.json
- Manifest updated: N total historical snapshots
- Git: <push outcome>
```

**Step 6 — Notify Matt via Slack/Telegram ONLY if something is structurally broken** (capture script failed, git push credentials missing, or the snapshot has fewer than 5 populated fragments). Do not notify for routine successful snapshots — the dropdown just shows the new week silently.

## Constraints

- Do NOT touch the dashboard HTML other than via `capture.js`. Matt has validated the layout and any structural change can break his morning triage.
- Do NOT rerun the daily refresh — that's a separate task.
- Do NOT delete existing snapshots even if they look stale; the backfilled `2026-W16` is intentional and older weeks will accumulate as history.
- Keep output concise; Matt reads the dashboard, not the logs.
