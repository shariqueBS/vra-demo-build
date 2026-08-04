# vra-demo-build

A deterministic Percy demo build for filming the six Visual Review Agent jobs-to-be-done.

**Start with [DEMO-SCRIPT.md](DEMO-SCRIPT.md)** — prerequisites, run order and the per-job shot list.

```bash
export PERCY_TOKEN=<project token>

git checkout main
./run-demo.sh baseline              # baseline — release 4.18.0

git checkout fix/checkout-cta-width
./run-demo.sh pr 1                  # PR build — nav rebrand ×16, 2 button bugs, 2 noise snapshots
                                    # the only mode that can produce AI RCA
./run-demo.sh drift                 # optional — only the 2 noise snapshots move
```

**AI RCA requires a GitHub pull-request build.** `percy-api`'s bug-remediation service refuses to
run unless `build.pull_request_number` is present and the project has a GitHub integration; it then
maps the visual bugs onto the PR's file patches. Re-baseline `main` before each PR build, or the PR
diffs against 4.19.0 content and shows nothing. Details in
[DEMO-SCRIPT.md](DEMO-SCRIPT.md#why-job-6-needs-github--corrected).

## Layout

```
app/                  the "Aurelia" storefront — 16 pages
  css/base.css        all shared styling; identical in every build
  js/layout.js        injects nav + footer, binds variant data
  img/*.svg           generated locally, no external assets
  variant.css         ← staged from variants/ by run-demo.sh
  variant.js          ← staged from variants/ by run-demo.sh
variants/v1|v2|v3/    the only files that differ between builds
snapshots.yml         16 snapshots with readable names
.percy.yml            single 1280px width
run-demo.sh           variant staging + static server + upload
tools/make-assets.js  regenerates app/img/
tools/render-check.sh renders every variant to PNG via headless Chrome
```

## Design constraints

- **One CSS property per regression.** Every bug traces to a single declaration in
  `variants/v2/variant.css`, so the AI RCA panel has one crisp cause to report instead of a
  list of candidates.
- **Deterministic.** No web fonts, animation, network assets or random values. Re-rendering
  produces byte-identical PNGs, so retakes never change the diffs.
- **DOM capture, not image upload.** RCA is computed from the DOM/CSS snapshot pair, so the
  build must be produced with `percy snapshot`.
- **Single 1280px width.** The app has no responsive breakpoints; adding a mobile width would
  manufacture layout bugs on every page and bury the engineered ones.

## Requirements

`node` + `npx`, `@percy/cli` (installed globally at 1.30.6), `python3` for the static server,
and Google Chrome only if you use `tools/render-check.sh`.
