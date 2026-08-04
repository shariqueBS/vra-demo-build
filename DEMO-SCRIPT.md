# VRA demo build — runbook and shot list

A 16-snapshot storefront ("Aurelia") that produces three Percy builds engineered so that
each of the six jobs-to-be-done has a specific, reliable place to be demonstrated on camera.

Everything is deterministic: no web fonts, no animation, no network assets, no random values.
Re-running a variant produces byte-identical renders, so a retake never changes the diffs.

**Project:** Demo project 4 August 2026 · `test/web/Demo-project-4-August-2026-bb35d626`

| Build | Release | What it is | Link |
|---|---|---|---|
| 1 | 4.18.0 | baseline, 16 new snapshots, no diffs | [52516489](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52516489) |
| 2 | 4.19.0 | the main build — jobs 2, 3, 4, 5, 6 | [52516878](https://percy.io/test/web/Demo-project-4-August-2026-bb35d626/builds/52516878) |
| 3 | 4.19.1 | drift build — the saved-prompt payoff | run `./run-demo.sh drift` |

> Superseded: the first attempt used project `ce758c61/web/Demo-project-4-August-2026-78d296a8`
> (builds 52513422 and 52515699). That account did not have Percy AI enabled, so those builds have
> no AI surfaces and should not be filmed.

---

## 1. Status of prerequisites

| # | Prerequisite | Status |
|---|---|---|
| 1 | Group with BrowserStack AI enabled | ✅ group 2 |
| 2 | Percy AI toggle | ✅ on (was off for build 1, turned on before build 2) |
| 3 | `rca-enabled` flag | ✅ enabled in group 2 |
| 4 | Jira integration | ⚠️ not connected — **button and panel view only**, do not script a click-through to a created ticket |
| 5 | `PERCY_TOKEN` | ✅ |

> Verified while building this: AI RCA works off the DOM/CSS snapshot pair
> (`percy-web/app/services/rca.js` → `parseHTMLDifferencesWithPosition`, `base_dom_sha` /
> `head_dom_sha`), **not** off a linked git repo. So no GitHub integration is needed — but it
> does mean the build must capture DOM. That is why this demo uses `percy snapshot`
> and not image-only `percy upload`.

---

## 2. Run order

```bash
export PERCY_TOKEN=<project token>
cd vra-demo-build

./run-demo.sh baseline     # build 1 — done, AI toggle was off
                           # ── Job 1 filmed here: turn the Percy AI toggle ON ──
./run-demo.sh candidate    # build 2 — done. Jobs 2, 3, 4, 6 and the first half of 5
                           # ── film Job 5 here: Ignore diff → save prompt ──
./run-demo.sh drift        # build 3 — run AFTER saving the prompt, to show it working
```

`./run-demo.sh check` renders every variant locally and dry-runs Percy without uploading.

Build 1 is intentionally AI-free: a baseline has no comparisons, so there is nothing for the AI
to analyse.

---

## 3. What is in build 2

Deliberately small — four kinds of change, each with a clear expected AI verdict.

### One intentional change, on all 16 snapshots

The nav label top-right changed **"Cart" → "Bag"** — a site-wide rebrand of the cart affordance.
It also nudges "Sign in" leftward, so the diff region covers the whole nav cluster.

Every snapshot in the build carries this and nothing else, except the four below. Two things to
watch for on camera:

- The AI should read it as an **intended change, not a bug** — it is legible, complete, well-placed.
- It is one **recurring pattern across 16 snapshots**, which is the story for the build summary.

### Two regressions — these should score as bugs

| Snapshot | What a reviewer sees | Single root cause |
|---|---|---|
| **Checkout** | "Place order · $214.00" clipped to "e order · $21" — cut off at *both* ends | `.btn--place-order` width `168px → 96px` |
| **Sign in** | Submit button *and* "Forgot password" completely cut off; card ends under the password field | `.login-card` gained `height: 268px; overflow: hidden` |

Both are button regressions, both trace to exactly one CSS property — which is what makes the RCA
shot crisp rather than a list of candidate selectors.

### Two dynamic-content diffs — these are what the AI should learn to ignore

| Snapshot | Churn |
|---|---|
| **Seller dashboard** | `Live data · last synced 09:41:12 → 16:07:48`, session id `sess_7f3a91c2 → sess_b2d40e19` |
| **Order tracking** | Carrier clock, tracking id, latest scan, and five relative feed times ("2 minutes ago" → "5 minutes ago") |

Both use the same `sync-strip` pattern, so **one saved prompt should cover both** — that is the
point of the Job 5 payoff.

### Verified before upload

Rendered every variant in headless Chrome and hash-compared:

- v1 → v2: all sampled snapshots changed (the nav is global), with Checkout / Sign in / Seller
  dashboard / Order tracking carrying their extra change on top
- v2 → v3: **only** Seller dashboard and Order tracking move — both regressions stay broken and
  the nav stays "Bag", so nothing else reappears
- v1 is byte-identical to what build 1 uploaded, so the baseline is still valid

---

## 4. Shot list

### Job 1 — Set up VRA
*Stat: 84.7% of paid MAG have the toggle on; 74.5% reached an AI-enabled build review.*

Filmed. Build 1 with the toggle off shows no AI surfaces anywhere; flipping the **Percy AI**
toggle in project settings is the gate for everything that follows.

### Job 2 — Review builds using AI-highlighted changes
*Stat: 73.4% of paid MAG approved/rejected with AI attribution; 86.7% of AI-enabled MAG.*

1. Open build 2. Confirm the build-level AI toggle is on.
2. Open **Checkout** — the clipped "Place order" button. AI highlights the region and attributes it.
3. **Reject** it. That single action is the event behind this stat.
4. Open **Cart** — nav change only — and approve, to show the approve path and the contrast with
   a change that is not a bug.

### Job 3 — Understand changes across the whole build first
*Stat: 63.6% saw an AI build summary; 19.0% clicked Show More — 29.9% of those who saw one.*

1. Stay at the top of build 2, on the AI build summary.
2. Read the collapsed summary aloud, then click **Show More**.
3. The narrative to land: one rebrand recurring across all 16 snapshots, two genuine button
   breakages, and two snapshots that only moved because of live data. That is what the summary
   exists to tell you before you open a single snapshot.

### Job 4 — Review the snapshots most likely to be bugs first
*Stat: 69.2% of paid MAG were exposed to bug-sorted diffs.*

1. Switch the sort to **Sort by Bugs (High to Low)**.
2. Checkout and Sign in should rise above the twelve nav-only snapshots and the two
   dynamic-content ones.
3. Reject the top item to close the loop.

> The exact ordering is the model's call, not something this build can pin down. What the build
> *does* guarantee is a genuine three-tier spread: two real breakages, one intentional restyle,
> two pure-noise snapshots. **Do a dry run before filming** so you know the actual order and can
> narrate it confidently.

### Job 5 — Correct inaccurate AI output with a custom prompt
*Stat: 11.3% clicked "Ignore this diff"; only 0.5% saved a prompt — the biggest drop-off of the six.*

1. Open **Order tracking**. The only difference beyond the nav is a clock, a tracking id, a scan
   location and five relative timestamps — nobody wants these flagged, every build.
2. Click **Ignore this diff**.
3. Read the generated prompt, **preview** the updated snapshot, then **Save prompt**.
4. Note that **Seller dashboard** has the same `sync-strip` pattern — worth showing that one
   prompt is meant to cover both, not one prompt per snapshot.
5. Now run `./run-demo.sh drift` and open build 3. Verified: only those two snapshots moved. So
   build 3 is a clean test of whether the saved prompt did its job.

This is the shot worth the most rehearsal — 0.5% saved-prompt adoption is the number in the deck,
and build 3 is the argument for why anyone should bother.

### Job 6 — Understand the code change behind a visual bug
*Stat: 2.3% opened the AI RCA panel; 1.1% created a Jira issue.*

1. Back on build 2, open **Checkout** — the clipped button.
2. Click the **AI RCA** button and open the code panel. The bug has exactly one cause,
   `.btn--place-order { width: 168px → 96px }`, so the explanation should be crisp.
3. Show the **report to Jira** button and the panel it opens.

⚠️ Jira is not connected on this group, so **do not click through to create the ticket** — it will
fail at submit. Button and panel view only, as agreed.

**Sign in** is the backup shot if the Checkout RCA is unclear: a card that gained
`height: 268px; overflow: hidden` is about as explainable as a root cause gets.

---

## 5. Retakes and resets

- **Re-run any variant freely.** Renders are byte-deterministic, so a retake produces the same
  snapshots. But re-running `candidate` creates a *new* build compared against the previous one,
  which will show zero diffs. To redo the build-2 shots: re-run `baseline`, then `candidate`.
- **Approvals stick.** Once you approve snapshots in build 2 they become the baseline. For a clean
  build 2 again, re-run `baseline` first.
- **Saved prompts persist at project level.** After filming Job 5, delete the saved prompt before
  re-filming, or the noise diffs will already be suppressed.
- Cheapest reset for a full re-shoot: create a fresh Percy project and start from build 1.

## 6. Local iteration

```bash
./tools/render-check.sh    # every variant → PNG in tools/render/<variant>/, no Percy needed
./run-demo.sh check        # Percy dry-run: confirms all 16 snapshots resolve
```

To change a diff, edit only `variants/v*/variant.css` (CSS regressions) or
`variants/v*/variant.js` (copy, imagery, dynamic content). Base layout lives in
`app/css/base.css` and is identical across all three builds by design — that is what keeps every
regression traceable to a single property, which is what makes the RCA shot work.

Do not rename anything in `snapshots.yml`: Percy pairs snapshots by name, and a rename breaks the
comparison into a delete plus an add.

### Diffs available but not used in build 2

`app/css/base.css` and the page markup still support several more regressions, if you later want a
richer build: price-overlaps-title on **Product listing** (`.product-card__price` top), a broken
hero asset on **Product detail** (`images.pdp`), inputs overflowing their card on
**Account settings** (`.settings-card .form-input` width), an invisible chart legend on
**Seller dashboard** (`.chart-legend` colour), column misalignment on **Order history**
(`td.qty` padding-right — note `padding-left` does nothing on a right-aligned cell), plus a hero
CTA colour change, a blog line-height reflow, pricing copy, rotating avatars and a rotating promo
creative. Each is a one-property change in `variants/v2/`.
