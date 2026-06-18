#!/usr/bin/env python3
"""
scrape-images-apify.py — pull every image from an Instagram account via the
Apify actor `apify/instagram-scraper`, then download them locally.

Why Apify: the actor runs in Apify's cloud and deals with Instagram's auth and
anti-bot for you, returning clean JSON. We just extract the image URLs and
download them. No browser login needed on your machine.

Requirements:
  - An Apify API token. Get one free at https://console.apify.com/account/integrations
  - Export it:  export APIFY_TOKEN=apify_api_xxxxx
  - Stdlib only — no pip installs.

Usage:
  export APIFY_TOKEN=apify_api_xxxxx
  ./scripts/scrape-images-apify.py                          # defaults to wepray2flourish
  ./scripts/scrape-images-apify.py wepray2flourish
  ./scripts/scrape-images-apify.py https://www.instagram.com/wepray2flourish/ --limit 200 --out ./ig-images
  ./scripts/scrape-images-apify.py wepray2flourish --include-video-thumbs
"""
import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ACTOR = "apify~instagram-scraper"  # apify/instagram-scraper
API = "https://api.apify.com/v2"


def die(msg: str, code: int = 1):
    print(f"!! {msg}", file=sys.stderr)
    sys.exit(code)


def normalize_url(target: str) -> str:
    if target.startswith("http"):
        return target.rstrip("/") + "/"
    return f"https://www.instagram.com/{target.lstrip('@')}/"


def run_actor(token: str, profile_url: str, limit: int) -> list:
    """Run the actor synchronously and return dataset items (post objects)."""
    payload = {
        "directUrls": [profile_url],
        "resultsType": "posts",
        "resultsLimit": limit,
        "addParentData": False,
    }
    url = f"{API}/acts/{ACTOR}/run-sync-get-dataset-items?token={urllib.parse.quote(token)}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    print(f">> Running {ACTOR} on {profile_url} (limit {limit})...")
    print(">> This runs in Apify's cloud and may take 30-90s.")
    try:
        with urllib.request.urlopen(req, timeout=600) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:500]
        if e.code in (401, 403):
            die(f"Auth failed ({e.code}). Check APIFY_TOKEN. Server said: {body}")
        die(f"Apify API error {e.code}: {body}")
    except urllib.error.URLError as e:
        die(f"Network error reaching Apify: {e.reason}")


def collect_images(items: list, include_video_thumbs: bool) -> list:
    """Return [(url, suggested_name), ...] deduped, in post order."""
    seen = set()
    out = []
    for it in items:
        shortcode = it.get("shortCode") or it.get("id") or f"post{len(out)}"
        is_video = it.get("type") == "Video" or bool(it.get("videoUrl"))
        urls = []
        # Carousel / sidecar posts expose every slide in `images`.
        for u in it.get("images") or []:
            if isinstance(u, str):
                urls.append(u)
        # Single image post (or video poster frame).
        disp = it.get("displayUrl")
        if disp and (not is_video or include_video_thumbs):
            urls.append(disp)
        for i, u in enumerate(urls):
            if u in seen:
                continue
            seen.add(u)
            ext = Path(urllib.parse.urlparse(u).path).suffix or ".jpg"
            out.append((u, f"{shortcode}_{i}{ext}"))
    return out


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())
        return True
    except Exception as e:
        print(f"   skip {dest.name}: {e}", file=sys.stderr)
        return False


def main():
    ap = argparse.ArgumentParser(description="Scrape IG images via Apify.")
    ap.add_argument("target", nargs="?", default="wepray2flourish",
                    help="IG handle or full profile URL")
    ap.add_argument("--limit", type=int, default=200, help="max posts to fetch")
    ap.add_argument("--out", default="./scraped-images", help="output directory")
    ap.add_argument("--include-video-thumbs", action="store_true",
                    help="also save poster frames of video posts")
    args = ap.parse_args()

    token = os.environ.get("APIFY_TOKEN") or os.environ.get("APIFY_API_TOKEN")
    if not token:
        die("Set APIFY_TOKEN first:  export APIFY_TOKEN=apify_api_xxxxx\n"
            "   Get a free token at https://console.apify.com/account/integrations")

    profile_url = normalize_url(args.target)
    items = run_actor(token, profile_url, args.limit)
    if not items:
        die("Actor returned 0 items. The profile may be empty, private, or the "
            "handle is wrong.")
    # An error item (private/blocked) comes back as a single object with `error`.
    if len(items) == 1 and items[0].get("error"):
        die(f"Actor reported: {items[0].get('error')} - {items[0].get('errorDescription','')}")

    images = collect_images(items, args.include_video_thumbs)
    print(f">> {len(items)} posts -> {len(images)} images to download")

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    ok = 0
    for url, name in images:
        if download(url, out_dir / name):
            ok += 1
            print(f"   [{ok}/{len(images)}] {name}")
        time.sleep(0.2)  # be gentle with IG's CDN

    print(f"\n>> Done. {ok}/{len(images)} images saved to {out_dir.resolve()}")
    if ok < len(images):
        print(">> Some downloads failed (CDN URLs expire fast). Re-run to retry.")


if __name__ == "__main__":
    main()
