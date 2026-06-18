#!/usr/bin/env bash
#
# scrape-images.sh — download all images from an Instagram account (or any
# gallery-dl-supported site) into a local folder.
#
# Why gallery-dl: it's the actively-maintained, tried-and-true tool for this.
# It handles Instagram's pagination/auth, dedups, and resumes where it left off.
#
# IMPORTANT: Instagram blocks anonymous scraping. You MUST be logged into
# instagram.com in a local browser (Chrome/Firefox/Safari/Edge). This script
# borrows that login cookie via --cookies-from-browser. No password is stored.
#
# Usage:
#   ./scripts/scrape-images.sh                         # defaults to wepray2flourish via Chrome
#   ./scripts/scrape-images.sh <url-or-handle>         # any IG handle or full URL
#   ./scripts/scrape-images.sh <url-or-handle> <browser>   # firefox | safari | edge | chrome
#   ./scripts/scrape-images.sh <url-or-handle> <browser> <out-dir>
#
# The <browser> arg passes straight to gallery-dl's --cookies-from-browser, so
# you can target a specific profile/container, e.g. "chrome:Default" or
# "chrome:Profile 1" or "firefox". Whichever you pick MUST be logged into
# instagram.com — otherwise IG returns "user could not be found".
#
# Examples:
#   ./scripts/scrape-images.sh wepray2flourish firefox
#   ./scripts/scrape-images.sh wepray2flourish "chrome:Profile 1"
#   ./scripts/scrape-images.sh https://www.instagram.com/wepray2flourish/ chrome ./ig-images
#
set -euo pipefail

TARGET="${1:-https://www.instagram.com/wepray2flourish/}"
BROWSER="${2:-chrome}"
OUT_DIR="${3:-./scraped-images}"

# Accept a bare handle ("wepray2flourish") or a full URL.
case "$TARGET" in
  http*://*) URL="$TARGET" ;;
  *)         URL="https://www.instagram.com/${TARGET#@}/" ;;
esac

# --- ensure gallery-dl is available -----------------------------------------
if ! command -v gallery-dl >/dev/null 2>&1; then
  echo ">> gallery-dl not found. Installing with pipx..."
  if command -v pipx >/dev/null 2>&1; then
    pipx install gallery-dl
  elif command -v brew >/dev/null 2>&1; then
    brew install gallery-dl
  else
    echo "!! Need pipx or brew to install gallery-dl. Install one, then re-run." >&2
    exit 1
  fi
fi

echo ">> Target : $URL"
echo ">> Browser: $BROWSER (login cookies are read from here)"
echo ">> Output : $OUT_DIR"
echo

# --- run --------------------------------------------------------------------
# --cookies-from-browser : use your existing Instagram login (no password needed)
# -D                     : flat output directory (no nested folders)
# --filter               : images only — skip videos/reels
# Remove the --filter line if you also want video posts downloaded.
if ! gallery-dl \
  --cookies-from-browser "$BROWSER" \
  -D "$OUT_DIR" \
  --filter "extension not in ('mp4','m4v','mov')" \
  "$URL"; then
  echo
  echo "!! Scrape failed. Most common cause: the '$BROWSER' session is not logged" >&2
  echo "   into instagram.com. Instagram blocks anonymous profile access, so a" >&2
  echo "   'user could not be found' error usually means 'not authenticated'." >&2
  echo "   Fix: open $BROWSER, log into instagram.com, then re-run. Or point at the" >&2
  echo "   right profile, e.g.  ./scripts/scrape-images.sh '$TARGET' 'chrome:Profile 1'" >&2
  exit 1
fi

echo
echo ">> Done. Files in: $OUT_DIR"
ls -1 "$OUT_DIR" 2>/dev/null | head -20 || true
COUNT=$(find "$OUT_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')
echo ">> Total files: $COUNT"
