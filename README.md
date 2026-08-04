# vra-demo-build

A deterministic Percy demo build for filming the six Visual Review Agent jobs-to-be-done.

**Start with [DEMO-SCRIPT.md](DEMO-SCRIPT.md)** — prerequisites, run order and the per-job shot list.

```bash
export PERCY_TOKEN=<project token>
./run-demo.sh baseline     # build 1 — clean
./run-demo.sh candidate    # build 2 — nav rebrand on all 16, 2 button bugs, 2 noise snapshots
./run-demo.sh drift        # build 3 — only the 2 noise snapshots move
```

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
