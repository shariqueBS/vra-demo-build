#!/usr/bin/env bash
# Renders every page of both variants to PNG with headless Chrome so you can eyeball
# the engineered diffs before spending a Percy build. Output: tools/render/<variant>/
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"
APP="$ROOT/app"
PORT="${PORT:-8421}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PAGES=(index products product cart checkout login account orders dashboard
       pricing blog deals reviews order-status about help)

[[ -x "$CHROME" ]] || { echo "Chrome not found at $CHROME" >&2; exit 1; }

python3 -m http.server "$PORT" --directory "$APP" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
until curl -sf "http://localhost:$PORT/index.html" >/dev/null; do sleep 0.2; done

for v in v1 v2 v3; do
  cp "$ROOT/variants/$v/variant.css" "$APP/variant.css"
  cp "$ROOT/variants/$v/variant.js"  "$APP/variant.js"
  out="$HERE/render/$v"; mkdir -p "$out"
  for p in "${PAGES[@]}"; do
    "$CHROME" --headless --disable-gpu --hide-scrollbars \
      --window-size=1280,1200 \
      --screenshot="$out/$p.png" \
      "http://localhost:$PORT/$p.html" >/dev/null 2>&1
  done
  echo "rendered $v -> tools/render/$v/ ($(ls "$out" | wc -l | tr -d ' ') pages)"
done
