#!/usr/bin/env bash
# ============================================================================
# Percy VRA demo build runner
#
#   ./run-demo.sh baseline    # release 4.18.0 — the clean build
#   ./run-demo.sh candidate   # release 4.19.0 — 6 regressions, 2 intentional
#                             #                  changes, 4 dynamic-content diffs
#   ./run-demo.sh drift       # release 4.19.1 — nothing fixed, only the dynamic
#                             #                  content churns (prompt payoff)
#   ./run-demo.sh pr <n>      # snapshot the checked-out branch as GitHub PR #n
#                             #   — the ONLY mode that can produce AI RCA
#   ./run-demo.sh check       # render all variants locally, no upload
#
# Requires PERCY_TOKEN for the production Percy project you are demoing in.
# ============================================================================

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$HERE/app"
PORT="${PORT:-8420}"
MODE="${1:-}"

RED=$'\033[31m'; GRN=$'\033[32m'; YLW=$'\033[33m'; DIM=$'\033[2m'; OFF=$'\033[0m'

die() { echo "${RED}✗ $*${OFF}" >&2; exit 1; }
say() { echo "${GRN}▸${OFF} $*"; }

# ---------------------------------------------------------------------------
# Variant selection
# ---------------------------------------------------------------------------
use_variant() {
  local v="$1"
  [[ -d "$HERE/variants/$v" ]] || die "no such variant: $v"
  cp "$HERE/variants/$v/variant.css" "$APP/variant.css"
  cp "$HERE/variants/$v/variant.js"  "$APP/variant.js"
  say "variant ${YLW}$v${OFF} staged into app/"
}

# ---------------------------------------------------------------------------
# Static server lifecycle
# ---------------------------------------------------------------------------
SERVER_PID=""
stop_server() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap stop_server EXIT

start_server() {
  if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
    die "port $PORT is already in use. Set PORT=<other> or free it."
  fi
  python3 -m http.server "$PORT" --directory "$APP" >/dev/null 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 40); do
    if curl -sf "http://localhost:$PORT/index.html" >/dev/null 2>&1; then
      say "serving app/ on ${DIM}http://localhost:$PORT${OFF}"
      return 0
    fi
    sleep 0.25
  done
  die "static server did not come up on port $PORT"
}

# ---------------------------------------------------------------------------
# Percy upload
# ---------------------------------------------------------------------------
upload() {
  local variant="$1" branch="$2" commit="$3" label="$4"

  [[ -n "${PERCY_TOKEN:-}" ]] || die "PERCY_TOKEN is not set. export PERCY_TOKEN=<project token>"

  use_variant "$variant"
  start_server

  say "uploading ${YLW}$label${OFF} to Percy (branch=$branch)"
  PERCY_BRANCH="$branch" \
  PERCY_COMMIT="$commit" \
  PERCY_PARALLEL_TOTAL="" \
    npx percy snapshot "$HERE/snapshots.yml" \
      --base-url "http://localhost:$PORT" \
      --config "$HERE/.percy.yml"

  stop_server
  echo
  say "done — open the build in the Percy dashboard"
}

# ---------------------------------------------------------------------------
# Pull-request upload — the only mode that can produce AI RCA.
#
# AI RCA (the `bug-code-rca` feature) refuses to run unless the build is a
# GitHub pull-request build. From
# percy-api/app/services/percy/bug_remediation_service/service.rb:
#
#   unless build.pull_request_number.present? &&
#          build.version_control_integration&.github?
#     skip_remediation(reason: 'not_github_pr')
#
# Percy then fetches the PR's file patches from GitHub and asks the AI to map
# the visual bugs onto them, returning `contributing_files`. So this mode does
# NOT stage a variant — it snapshots the working tree exactly as checked out,
# and reports the real branch, commit and PR number, so the diff Percy reads
# from GitHub is genuinely the cause of the bugs on screen.
# ---------------------------------------------------------------------------
upload_pr() {
  local pr="$1" target="${2:-main}"

  [[ -n "${PERCY_TOKEN:-}" ]] || die "PERCY_TOKEN is not set. export PERCY_TOKEN=<project token>"
  [[ -n "$pr" ]] || die "usage: ./run-demo.sh pr <pull-request-number> [target-branch]"

  local branch commit
  branch="$(git -C "$HERE" rev-parse --abbrev-ref HEAD)"
  commit="$(git -C "$HERE" rev-parse HEAD)"

  [[ "$branch" != "$target" ]] || die "you are on '$target' — check out the PR branch first."

  if [[ -n "$(git -C "$HERE" status --porcelain -- app variants)" ]]; then
    die "working tree is dirty under app/ or variants/.
     Commit or discard those changes, otherwise the snapshots will not match
     the PR diff that Percy fetches from GitHub and the RCA will be wrong."
  fi

  start_server

  say "uploading PR #$pr — branch ${YLW}$branch${OFF} → $target, commit ${DIM}${commit:0:9}${OFF}"
  PERCY_BRANCH="$branch" \
  PERCY_COMMIT="$commit" \
  PERCY_TARGET_BRANCH="$target" \
  PERCY_PULL_REQUEST="$pr" \
    npx percy snapshot "$HERE/snapshots.yml" \
      --base-url "http://localhost:$PORT" \
      --config "$HERE/.percy.yml"

  stop_server
  echo
  say "done — the build should show a PR link."
  echo "  ${DIM}If the RCA button is missing, check in order:${OFF}"
  echo "  ${DIM}1. the repo is linked to this Percy project via the GitHub integration${OFF}"
  echo "  ${DIM}2. 'bug-code-rca' is on for the org (backend flag AND LaunchDarkly)${OFF}"
  echo "  ${DIM}3. the build actually has AI bug regions — no bugs means no RCA${OFF}"
}

# ---------------------------------------------------------------------------
# Local render check (no Percy account needed)
# ---------------------------------------------------------------------------
check() {
  for v in v1 v2 v3; do
    use_variant "$v"
    start_server
    npx percy snapshot "$HERE/snapshots.yml" \
      --base-url "http://localhost:$PORT" \
      --config "$HERE/.percy.yml" \
      --dry-run
    stop_server
  done
  say "both variants render and all 16 snapshots resolve"
}

case "$MODE" in
  baseline)
    upload v1 main d41f8ca2b7e93c1a05f6b8e42c99d7301fa5b6c8 "release 4.18.0 (baseline)"
    ;;
  candidate)
    upload v2 main 7b2e9f04ac1d8365e0f47b91c2a6d5e83019fc4b "release 4.19.0 (candidate)"
    ;;
  drift)
    upload v3 main 3e81c07d5b429af6182d0e73b45c9a2f60d18e97 "release 4.19.1 (drift)"
    ;;
  pr)
    upload_pr "${2:-}" "${3:-main}"
    ;;
  check)
    check
    ;;
  *)
    sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
