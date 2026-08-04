# VRA demo build — runbook and shot list

A 16-snapshot storefront ("Aurelia") that produces Percy builds engineered so each of the six
jobs-to-be-done has a specific, reliable place to be demonstrated on camera.

Everything is deterministic: no web fonts, no animation, no network assets, no random values.
Re-running a variant produces byte-identical renders, so a retake never changes the diffs.

**Percy project:** `test/web/Demo-project-4-August-2026-bb35d626`
**GitHub repo:** https://github.com/shariqueBS/vra-demo-build
**Pull request:** https://github.com/shariqueBS/vra-demo-build/pull/1

| Build | Release | Branch | What it is |
|---|---|---|---|
| [52516489](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52516489) | 4.18.0 | main | first baseline, 16 new snapshots |
| [52516878](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52516878) | 4.19.0 | main | spare — has the diffs, cannot show RCA (no PR) |
| [52518084](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52518084) | 4.18.0 | main | re-baseline |
| [52518103](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52518103) | 4.19.0 | PR #1 | dead — created **before** the repo was linked, so `repo_id` is nil |
| [52518575](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52518575) | 4.18.0 | main | re-baseline, repo now linked |
| **[52518587](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52518587)** | **4.19.0** | **PR #1** | **film everything here — jobs 2–6** |

Build 52518587 is the one to use: same diffs as 52516878, plus the GitHub PR metadata AI RCA
requires, and created after the repo was linked to the project.

Build 52518103 cannot be rescued. `percy-api/app/models/percy/build.rb:66` is `belongs_to :repo`,
so the repo is stamped onto the build at creation time rather than looked up later — a build created
before the repo was linked has `repo_id` nil forever. Any change to the integration needs a fresh
build.

---

## 1. Prerequisites

| # | Prerequisite | Status |
|---|---|---|
| 1 | Group with BrowserStack AI enabled | ✅ |
| 2 | Percy AI toggle on the project | ✅ |
| 3 | GitHub integration, repo linked to the project | ✅ `shariqueBS/vra-demo-build` linked |
| 4 | `bug-code-rca` for the org, backend flag **and** LaunchDarkly | ✅ confirmed working on build 52518587 |
| 5 | Jira integration | ⚠️ not connected — button and panel view only, do not submit |

### Why Job 6 needs GitHub — corrected

An earlier version of this doc claimed AI RCA works from the DOM snapshot pair and needs no
repo. **That was wrong.** It described a different feature: the DOM diff-inspector in
`percy-web/app/services/rca.js`, gated on the `rca-enabled` flag.

The AI RCA code panel in Job 6 is the `bug-code-rca` feature, and
`percy-api/app/services/percy/bug_remediation_service/service.rb:20-45` gates it on all of:

```ruby
unless organization.bug_remediation_enabled?                  # org flag 'bug-code-rca'
unless build.pull_request_number.present? &&                  # must be a PR build
       build.version_control_integration&.github?             # GitHub specifically
pr_changes = fetch_pr_code_patches(build: build)              # PR must contain code patches
if comparisons_data[:snapshots].blank?                        # must have AI bug regions
```

Only then does Percy call the AI with the PR patches, get back `contributing_files`, and merge
them into the AI regions. The button renders only when the active region has them
(`percy-web/app/components/builds/region-display.hbs:182`).

Consequences worth knowing:

- **GitHub only.** `.github?` — Bitbucket and Azure DevOps will not work.
- **`.css` and `.js` both count** as code files
  (`percy-api/app/services/percy/github/pull_request_service.rb:4-7`). Limits are 50 files per PR
  and 10KB of patch per file. `.sh`, `.md` and `.yml` are filtered out, which is why the tooling
  and docs commits in this repo cannot pollute the RCA input.
- **Two flags in two systems.** The backend reads `bug-code-rca` through
  `Percy::OrganizationFeatureFlags` (`organization.rb:791`); the frontend reads
  `variation('bug-code-rca')` from LaunchDarkly. Both must be on.
- The `rca-enabled` flag confirmed for group 2 is the *other* feature and does not help here.

---

## 2. Run order

```bash
export PERCY_TOKEN=<project token>
cd vra-demo-build

git checkout main
./run-demo.sh baseline              # baseline on main — release 4.18.0

git checkout fix/checkout-cta-width
./run-demo.sh pr 1                  # PR build — release 4.19.0, jobs 2–6
                                    # ── film Job 5 here: Ignore diff → save prompt ──
./run-demo.sh drift                 # optional: the saved-prompt payoff
```

Two things that are easy to get wrong:

- **Re-baseline `main` before every PR build.** Percy picks the latest build on the target branch
  as the baseline. If the last `main` build already has the 4.19.0 content, the PR build shows zero
  diffs — no bugs, therefore no RCA. That is exactly why build 52518084 exists.
- **`pr` mode does not stage a variant.** It snapshots the working tree as checked out and refuses
  to run if `app/` or `variants/` is dirty, because the snapshots must match the PR diff Percy
  fetches from GitHub — otherwise the RCA explains a change that is not on screen.

`./run-demo.sh check` renders every variant locally and dry-runs Percy without uploading.

---

## 3. What is in the PR build

Deliberately small — four kinds of change, each with a clear expected AI verdict.

### One intentional change, on all 16 snapshots

The nav label top-right changed **"Cart" → "Bag"** — a site-wide rebrand. It also nudges "Sign in"
leftward, so the diff region covers the whole nav cluster. Two things to watch for:

- The AI should read it as an **intended change, not a bug** — legible, complete, well-placed.
- It is one **recurring pattern across 16 snapshots**, which is the build-summary story.

### Two regressions — these should score as bugs

| Snapshot | What a reviewer sees | Root cause in the PR diff |
|---|---|---|
| **Checkout** | "Place order · $214.00" clipped to "e order · $21" — cut off at *both* ends | `.btn--place-order` width `168px → 96px` |
| **Sign in** | Submit button *and* "Forgot password" gone; card ends under the password field | `.login-card` gained `height: 268px; overflow: hidden` |

The PR diff is deliberately tiny — **two files, 18 lines**, of which only four are the regressions.
The commit message even reads like a well-intentioned design tweak. That is what makes the RCA shot
strong: there is almost nothing else in the diff for it to blame.

### Two dynamic-content diffs — what the AI should ignore

| Snapshot | Churn |
|---|---|
| **Seller dashboard** | `last synced 09:41:12 → 16:07:48`, session id |
| **Order tracking** | Carrier clock, tracking id, latest scan, five relative feed times |

Both use the same `sync-strip` pattern, so **one saved prompt should cover both**.

### Verified before upload

Rendered every variant in headless Chrome and hash-compared:

- v1 → v2: all snapshots changed (the nav is global), with Checkout / Sign in / Seller dashboard /
  Order tracking carrying their extra change on top
- v2 → v3: **only** Seller dashboard and Order tracking move
- v1 is byte-identical to what the first baseline uploaded

---

## 4. Shot list

### Job 1 — Set up VRA
*84.7% of paid MAG have the toggle on; 74.5% reached an AI-enabled build review.*

Filmed. Build 52516489 with the toggle off shows no AI surfaces; flipping **Percy AI** in project
settings is the gate for everything that follows.

### Job 2 — Review builds using AI-highlighted changes
*73.4% approved/rejected with AI attribution; 86.7% of AI-enabled MAG.*

1. Open the PR build. Confirm the build-level AI toggle is on.
2. Open **Checkout** — the clipped "Place order" button. AI highlights and attributes it.
3. **Reject** it. That action is the event behind this stat.
4. Open **Cart** — nav change only — and approve, to contrast a change that is not a bug.

### Job 3 — Understand changes across the whole build first
*63.6% saw an AI build summary; 19.0% clicked Show More — 29.9% of those who saw one.*

1. Stay at the top of the build, on the AI summary. Read the collapsed version, then **Show More**.
2. The narrative: one rebrand recurring across all 16 snapshots, two genuine button breakages, two
   snapshots that only moved because of live data — all before opening a single snapshot.

### Job 4 — Review the snapshots most likely to be bugs first
*69.2% were exposed to bug-sorted diffs.*

1. Switch to **Sort by Bugs (High to Low)**.
2. Checkout and Sign in should rise above the twelve nav-only snapshots and the two noise ones.
3. Reject the top item.

> Ordering is the model's call. The build guarantees a genuine three-tier spread; it cannot pin the
> sequence. **Do a dry run before filming** so you can narrate the real order.

### Job 5 — Correct inaccurate AI output with a custom prompt
*11.3% clicked "Ignore this diff"; only 0.5% saved a prompt — the biggest drop-off of the six.*

1. Open **Order tracking**. Beyond the nav, the only differences are a clock, a tracking id, a scan
   location and five relative timestamps — nobody wants these flagged every build.
2. Click **Ignore this diff**.
3. Read the generated prompt, **preview** the updated snapshot, then **Save prompt**.
4. Point out that **Seller dashboard** has the same `sync-strip` pattern — one prompt is meant to
   cover both, not one prompt per snapshot.
5. Now show the payoff. Two options:

   **Simple** — re-run the same PR build with no code change:
   ```bash
   git checkout main && ./run-demo.sh baseline
   git checkout fix/checkout-cta-width && ./run-demo.sh pr 1
   ```
   The two sync-strip snapshots were flagged on 52518587; on the new build they should not be. Same
   content, so it is a clean A/B.

   **Stronger** — churn the dynamic values first, so the prompt meets values it has never seen:
   ```bash
   git checkout fix/checkout-cta-width && ./run-demo.sh bump-noise
   git checkout main && ./run-demo.sh baseline
   git checkout fix/checkout-cta-width && ./run-demo.sh pr 1
   ```
   `bump-noise` commits and pushes release 4.19.1, which changes only the clock, session id,
   tracking id, last scan and five relative times. Suppressing *those* proves the prompt
   generalised rather than matching one exact frame.

> Do **not** use `./run-demo.sh drift` in the PR flow. It uploads on `main`, and `main` now holds the
> 4.18.0 baseline, so it would surface every diff rather than only the noise. The mode now warns and
> asks for confirmation before running.

Worth the most rehearsal: 0.5% saved-prompt adoption is the number in the deck, and step 5 is the
argument for why anyone should bother.

### Job 6 — Understand the code change behind a visual bug
*2.3% opened the AI RCA panel; 1.1% created a Jira issue.*

Needs prerequisites 3 and 4 above. Then:

1. Open **Checkout** on the PR build — the clipped button.
2. Click the **AI RCA** button and open the code panel. It should point at `app/variant.css` and the
   `width: 168px → 96px` hunk, because that is what is in the PR diff.
3. Show the **report to Jira** button and the panel it opens.

⚠️ Jira is not connected — **do not submit**, it will fail. Button and panel view only.

**Sign in** is the backup shot: `height: 268px; overflow: hidden` on `.login-card` is about as
explainable as a root cause gets.

If the RCA button is absent, work through it in this order — the runner prints the same list:

1. Is the repo linked to this Percy project through the GitHub integration?
2. Is `bug-code-rca` on for the org, in **both** the backend flags and LaunchDarkly?
3. Does the build have AI bug regions at all? No bugs means no RCA, by design.
4. Does the build page show a PR link? If not, `pull_request_number` never reached Percy and the
   guard fails before anything else.

---

## 5. Retakes and resets

- **Re-run any variant freely.** Renders are byte-deterministic, so retakes produce the same
  snapshots.
- **Always re-baseline `main` before re-running the PR build**, or it will show zero diffs.
- **Approvals stick.** Once you approve snapshots they become the baseline; re-baseline for a clean
  run.
- **Saved prompts persist at project level.** After filming Job 5, delete the saved prompt before
  re-filming, or the noise diffs will already be suppressed.
- Cheapest reset for a full re-shoot: a fresh Percy project, linked to the same repo.

## 6. Local iteration

```bash
./tools/render-check.sh    # every variant → PNG in tools/render/<variant>/, no Percy needed
./run-demo.sh check        # Percy dry-run: confirms all 16 snapshots resolve
```

Edit only `variants/v*/variant.css` (CSS regressions) or `variants/v*/variant.js` (copy, imagery,
dynamic content). `app/css/base.css` is identical across all releases by design — that is what keeps
every regression traceable to a single property, which is what makes the RCA output crisp.

**If you change what the PR build snapshots, the PR diff must change with it.** `app/variant.css`
and `app/variant.js` are the tracked files; commit them to the PR branch so GitHub and the
snapshots agree. `pr` mode refuses to run on a dirty tree for exactly this reason.

Do not rename anything in `snapshots.yml`: Percy pairs snapshots by name, and a rename becomes a
delete plus an add.

### Diffs available but not used

`app/css/base.css` and the page markup still support more one-property regressions if you want a
richer build: price-overlaps-title on **Product listing** (`.product-card__price` top), a broken
hero asset on **Product detail** (`images.pdp`), inputs overflowing their card on
**Account settings** (`.settings-card .form-input` width), an invisible chart legend on
**Seller dashboard** (`.chart-legend` colour), column misalignment on **Order history**
(`td.qty` padding-right — note `padding-left` does nothing on a right-aligned cell), plus a hero CTA
colour change, a blog line-height reflow, pricing copy, rotating avatars and a rotating promo
creative.
