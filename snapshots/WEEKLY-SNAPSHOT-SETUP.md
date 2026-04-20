# Weekly Snapshot Cron — Registration Instructions

The snapshot infrastructure is built and ready. One remaining step: register a Saturday 11:59 PM scheduled task that calls `node snapshots/capture.js` and pushes the result.

**How to register (one-time setup):**

Open a normal Cowork session (not inside a scheduled-task run) and paste:

> Create a scheduled task called **sds-command-center-weekly-snapshot** that runs every Saturday at 11:59 PM local time (cron `59 23 * * 6`) with the prompt in `/Users/Matt/Documents/Claude/Projects/SDS Dashboard/snapshots/WEEKLY-SNAPSHOT-PROMPT.md`.

Claude will invoke `create_scheduled_task` and the job will start running next Saturday night.

**What the task does each run:**

1. `cd` into the dashboard folder and runs `node snapshots/capture.js`, which extracts the current DATA / KPI / POD_KPIS / MBR_LIVE / OFFSITES constants and the six hardcoded HTML fragments, writing `snapshots/YYYY-WNN.json`.
2. Rebuilds `snapshots/index.json` (the manifest that drives the week-picker dropdown). The current in-progress week is excluded from the historical list.
3. Commits and pushes to GitHub Pages so the new week appears in Matt's dropdown by Sunday morning.
4. Only pings Matt on Slack/Telegram if the capture failed or the push got stuck on auth.

**Manual runs** (backfill, force-refresh, etc.):

```bash
cd "/Users/Matt/Documents/Claude/Projects/SDS Dashboard"
node snapshots/capture.js                        # capture current ISO week
node snapshots/capture.js --week=2026-W18        # capture a specific week key
node snapshots/capture.js --html=alt.html --week=2026-W15   # capture from alternate HTML
node snapshots/capture.js --index-only           # only rebuild index.json
```
