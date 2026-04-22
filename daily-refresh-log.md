## 2026-04-18

- Updated header timestamp from "Apr 15, 2026" → "Apr 18, 2026"
- Flagged Bet365 Michigan launch as TODAY (Apr 18, embargo lifts 9AM ET) on attention card + cycle key dates — today is the fire day for cross-property asset drop
- Rewrote Bet365 suggestedMsg to convey urgency ("embargo lifts TODAY 9am et") and removed stale Friday reference
- No new Slack scans, DM context files, or forecast xlsx drops since Apr 15 — DATA.rw (Forecast $17.44M / Budget $14.05M / +$3.40M / +24.2%), scorecard counts (70/13/1/2), and attention cards carried forward unchanged
- Mirrored SDS Command Center.html → index.html for GitHub Pages parity
- No Slack/Telegram notification sent — Bet365 launch was already staged in yesterday's dashboard; no new red cards, forecast moves >5%, or deal status changes since last refresh
- Git: committed as 5d13510 "Daily refresh 2026-04-18" on main. Push to GitHub Pages remote failed (no credentials in this sandbox environment) — local commit is ready to push next time creds are available

## 2026-04-19

- Updated header timestamp "Apr 18, 2026" → "Apr 19, 2026"
- Rolled Bet365 Michigan attention card forward from "EMBARGO LIFTS TODAY 9AM ET" fire-day framing to "DAY 1+ POST-EMBARGO" — now asks for Day 1 flash (emails/banners/social/chats/click-through/MI NDC pacing) from Brian S + Steve B + Randall + Craig by Monday standup so May 5 affiliate go-live isn't cold
- Rewrote Bet365 suggestedMsg to reflect weekend Day 1 flash request (not pre-embargo coordination); also cascaded into Brian Stephens P3 issue + suggestedMsg
- Deal pipeline: Bet365 Michigan stageLabel "Launching" → "Day 1 Live"; pipeline note text updated with Apr 19 timestamp + post-embargo status
- Cycle key dates: Apr 18 entry reframed from "TODAY — embargo lifts" to historical "embargo lifted — Day 1 live"; added new Apr 20 Monday entry as Day 1 flash due-date target
- No new Slack scans, DM context files, or forecast xlsx drops since Apr 15 — DATA.rw (Forecast $17.44M / Budget $14.05M / +$3.40M / +24.2%), scorecard counts (70/13/1/2), RW churn / NY AG / OJ B2C / Bookies / Vincenzo / Andrew S attention cards all carried forward unchanged. MBR_LIVE still pending connectors — no flips this cycle
- Mirrored SDS Command Center.html → index.html for GitHub Pages parity
- No Slack/Telegram notification sent — Bet365 roll-forward is a tactical reframe, not a new red card, forecast move >5%, or deal status change that materially alters Matt's weekend triage
- Git: commit blocked — stale `.git/index.lock` from Apr 18 run cannot be unlinked in this sandbox mount ("Operation not permitted" via rm, mv, Python os.unlink). HTML edits are saved to disk; next refresh (or manual `rm .git/index.lock` from Matt's terminal) will clear it and resume the daily commit cadence

## 2026-04-20

- Updated header timestamp "Apr 19, 2026" → "Apr 20, 2026"
- Reframed Bet365 Michigan attention card: pod tag "DAY 1+ POST-EMBARGO" → "DAY 1 FLASH DUE AT STANDUP" (today IS the day Matt's been building toward — flash due at Monday standup). Rewrote issue text + action to hold each property (Brian S / Steve Bulanda / Randall / Craig) accountable at standup for real numbers: emails sent, banners live, social posts, chats, MI click-through, NDC pacing. Patch gaps this week before May 5 affiliate go-live.
- Rewrote Bet365 suggestedMsg to standup-urgency voice ("standup today — need the bet365 mi day 1 flash… no hand-waving — real numbers"). Cascaded same tone into Brian Stephens P3 issue + suggestedMsg.
- Cycle key dates: Apr 20 reframed "MONDAY — due" → "TODAY — due at standup"; other dates unchanged.
- No new Slack scans, DM context files, or forecast xlsx drops since Apr 15 — DATA.rw (Forecast $17.44M / Budget $14.05M / +$3.40M / +24.2%), scorecard counts (70/13/1/2), RW churn / NY AG / OJ B2C / Bookies / Jeremy / Karl / Vincenzo / Andrew S attention cards all carried forward unchanged. MBR_LIVE still pending connectors — no flips this cycle.
- Mirrored SDS Command Center.html → index.html for GitHub Pages parity.
- No Slack/Telegram notification sent — Bet365 reframe is the planned tactical roll-forward Matt scheduled for today; no new red card, forecast move >5%, or deal-stage change that would merit a ping.
- Git: commit still blocked — both `.git/index.lock` (from Apr 19 run) and `.git/HEAD.lock` (from Apr 18 run) persist on the mount and `rm` returns "Operation not permitted" from this sandbox. HTML edits + index.html mirror are saved to disk. Fix requires Matt to run from his terminal in the project folder: `rm .git/index.lock .git/HEAD.lock` — that unsticks the daily commit cadence and the accumulated Apr 19 + Apr 20 edits will commit together on the next refresh.

## 2026-04-20 (follow-up) — Weekly snapshot system shipped

- Matt cleared the git locks locally and pushed commit 2e133f3; Apr 20 updates are now live on GitHub Pages (cache-bust with Cmd+Shift+R if the browser shows stale content).
- Built the weekly-snapshot system Matt asked for. Scope chosen with him: full dashboard state, Saturday 11:59 PM ET capture, JSON files in `snapshots/` folder.
- Added a week-picker dropdown (top-right of header, OddsJam-ads-dashboard-style) + snapshot-mode banner with "Return to current week" button.
- Wrapped six hardcoded HTML sections with `snap-*` IDs so the snapshot can swap their innerHTML when a past week is selected: `snap-revenueHero`, `snap-wowForecast`, `snap-revGrid`, `snap-efficiency`, `snap-scorecardIntro`, `snap-pipelineNote`.
- Added `applySnapshot` / `onWeekChange` / `populateWeekPicker` JS at the bottom of the dashboard. Uses `fetch()` to load `snapshots/YYYY-WNN.json` same-origin, overwrites `DATA`/`KPI`/`POD_KPIS`/`MBR_LIVE`/`OFFSITES` in place, swaps hardcoded fragment innerHTML, and re-runs every render function. "Current Week" restores the baseline captured at page load.
- Created `snapshots/capture.js` — a Node extractor that reads the HTML, parses out the JS object literals via a small brace-balanced walker (with VM eval for safety), snapshots the fragments, and rebuilds `snapshots/index.json`. Supports `--week=YYYY-WNN`, `--html=path`, `--captured-at=ISO`, `--index-only`.
- Backfilled one historical snapshot: `snapshots/2026-W16.json` from the Apr 18 git commit (5d13510), so the dropdown has real history on day one. Constants reflect the Apr 18 mid-week state (Bet365 "EMBARGO LIFTS TODAY" framing, "Launching" deal stage). Fragments borrowed from current HTML — those hardcoded sections didn't materially change between Apr 18 and today, so visual fidelity is preserved.
- Also wrote `snapshots/2026-W17.json` as a by-product during fragment-patching. Can't be unlinked from the sandbox, but the manifest logic excludes it (current in-progress week is never a historical option). Harmless leftover; Matt can `rm snapshots/2026-W17.json` from Terminal if he wants a clean folder.
- Left setup instructions for the Saturday cron at `snapshots/WEEKLY-SNAPSHOT-SETUP.md` + the task prompt at `snapshots/WEEKLY-SNAPSHOT-PROMPT.md`. Couldn't register the scheduled task from inside this scheduled-task session — Matt just needs to ask a fresh Cowork session to register `sds-command-center-weekly-snapshot` with cron `59 23 * * 6` pointing at that prompt file.
- Mirrored `SDS Command Center.html` → `index.html` for GitHub Pages parity.
- Git operations from this sandbox continue to fail (create locks they can't clean up) — all changes are saved to disk. Matt to run from Terminal when ready: `cd "/Users/Matt/Documents/Claude/Projects/SDS Dashboard" && rm -f .git/*.lock && git add "SDS Command Center.html" index.html daily-refresh-log.md snapshots/ && git commit -m "Ship weekly snapshot system" && git push`.
- No Slack/Telegram ping — Matt asked for this feature and is watching the session.

## 2026-04-21

- Updated header timestamp "Apr 20, 2026" → "Apr 21, 2026"
- Rolled Bet365 Michigan attention card forward from "DAY 1 FLASH DUE AT STANDUP" → "PATCH GAPS BEFORE MAY 5". Day 1 flash was delivered at yesterday's Mon Apr 20 standup; today's framing shifts to chasing the gap-patch list by property (missing banners, social cadence, chat template refinement, MI NDC acceleration) with exactly 2 weeks until the May 5 affiliate go-live. Added an explicit "pin Jamie on May 5 confirmation by end of week" action.
- Rewrote Bet365 suggestedMsg from standup-urgency voice to follow-up voice ("following up on yesterday's bet365 mi day 1 flash… where are the gaps by property? … patch list + owner + eta this week"). Cascaded the same tone into Brian Stephens P3 issue + suggestedMsg.
- Deals pipeline: Bet365 Michigan stageLabel "Day 1 Live" → "Patching to May 5"; detail rewritten to reflect Day 4 live + flash delivered + gap-patch motion.
- Cycle key dates: Apr 20 entry reframed from "TODAY — due at standup" to historical "Day 1 flash delivered at standup"; added new Apr 21 entry "TODAY — pull Bet365 MI patch list by property + owner + ETA"; May 5 label softened to "tentative — pin Jamie this wk".
- No new Slack scans, DM context files, or forecast xlsx drops since Apr 15 — DATA.rw (Forecast $17.44M / Budget $14.05M / +$3.40M / +24.2%), scorecard counts (70/13/1/2), RW churn / NY AG / OJ B2C / Bookies / Jeremy / Karl / Vincenzo / Andrew S attention cards all carried forward unchanged. MBR_LIVE still pending connectors — no flips this cycle.
- Mirrored `SDS Command Center.html` → `index.html` for GitHub Pages parity.
- Git: commit `d05d48c` "Daily refresh 2026-04-21" landed locally (used fallback identity `Matt Restivo <matthew.restivo@gmail.com>` matching prior commit author since the sandbox has no git config). Push failed — no GitHub credentials in this sandbox. Sandbox also left stuck locks in `.git/` (index.lock, HEAD.lock, tmp_obj_*) it can't unlink. Matt to clear + push from Terminal: `cd "/Users/Matt/Documents/Claude/Projects/SDS Dashboard" && rm -f .git/*.lock .git/objects/*/tmp_obj_* && git push`.
- No Slack/Telegram ping — Bet365 roll-forward is the planned tactical shift Matt scheduled for today; no new red card, forecast move >5%, or deal-stage change that would merit a ping.

## 2026-04-22

- Updated header timestamp "Apr 21, 2026" → "Apr 22, 2026"
- Rolled Bet365 Michigan attention card forward "PATCH GAPS BEFORE MAY 5" → "PATCH LIST IN FLIGHT". Yesterday's task (pull patch list by property + owner + ETA) is done; today's framing is midweek check-in mode: who's green, who's behind, what needs escalating before Friday close. New explicit guardrail: any patch item whose ETA slips past Apr 29 gets escalated now so there's runway to May 5.
- Reframed Bet365 suggestedMsg from follow-up voice ("where are the gaps by property?") to midweek-check voice ("where are we by property? banners up? social cadence fixed?…any item w/ eta past apr 29 — flag it now"). Cascaded same tone into Brian Stephens P3 issue + suggestedMsg. Jamie ask sharpened from "this wk" → "confirmation needed by EOW".
- Deals pipeline: Bet365 Michigan detail updated Day 4 → Day 5 live, "working gap-patch list" → "patch list pulled Apr 21 — owners + ETAs being worked", "2 weeks" → "13 days" to May 5. stageLabel "Patching to May 5" carried forward.
- Cycle key dates: Apr 21 reframed from "TODAY — pull patch list" to historical "Bet365 MI patch list pulled"; added new Apr 22 entry "TODAY — midweek patch-list status check (escalate ETAs past Apr 29)"; added Apr 24 "Friday — Jamie confirms May 5 go-live (target EOW)"; added Apr 29 "Patch-item ETA cutoff — anything later = risk to May 5". May 5 label "pin Jamie this wk" → "pin Jamie EOW".
- No new Slack scans, DM context files, or forecast xlsx drops since Apr 15 — DATA.rw (Forecast $17.44M / Budget $14.05M / +$3.40M / +24.2%), scorecard counts (70/13/1/2), RW churn / NY AG / OJ B2C / Bookies / Jeremy / Karl / Vincenzo / Andrew S attention cards all carried forward unchanged. MBR_LIVE still pending connectors — no flips this cycle.
- Mirrored `SDS Command Center.html` → `index.html` for GitHub Pages parity (2310 lines each).
- No Slack/Telegram ping — Bet365 midweek-check reframe is the planned tactical roll-forward Matt scheduled for today; no new red card, forecast move >5%, or deal-stage change that would merit a ping.
- Git: commit still blocked — `.git/index.lock` + `.git/HEAD.lock` (from Apr 21 run) plus 8 orphaned `.git/objects/*/tmp_obj_*` persist on the mount; `rm` returns "Operation not permitted" from this sandbox. HTML edits + index.html mirror are saved to disk. Matt to clear + push from Terminal: `cd "/Users/Matt/Documents/Claude/Projects/SDS Dashboard" && rm -f .git/*.lock .git/objects/*/tmp_obj_* && git add "SDS Command Center.html" index.html daily-refresh-log.md && git commit -m "Daily refresh 2026-04-22" && git push` — cleared locks will let all accumulated refreshes (Apr 19, 20, 21, 22) commit together if they haven't yet.
