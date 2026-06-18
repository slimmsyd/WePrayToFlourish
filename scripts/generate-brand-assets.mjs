/**
 * Generate brand assets (favicon + Open Graph / Twitter share image) from the
 * "We Pray To Flourish" logo at public/logo.jpg.
 *
 *   Favicon  -> the peace-sign hand cropped square (legible in a browser tab)
 *   OG image -> the full wordmark centered on the brand "paper" canvas (1200x630)
 *
 * Outputs are written into app/ so Next.js 16 picks them up automatically via
 * its file-based metadata conventions (favicon.ico, icon.png, apple-icon.png,
 * opengraph-image.png, twitter-image.png).
 *
 * Run: node scripts/generate-brand-assets.mjs
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, rmSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "public", "logo.jpg");
const APP = join(root, "app");
const TMP_TRANS = join(root, "scripts", ".logo-transparent.png");

// Brand colors (from app/globals.css)
const PAPER = "#f6f2ea";

// Hand crop in source pixel coords (verified against the 1712x608 logo).
// Tightened to exclude the neighbouring "y" and "F" strokes.
const HAND = { left: 728, top: 108, width: 296, height: 296 };
const HAND_PAD = 34; // breathing room around the mark

// Knock the white paper out of the logo so only the ink strokes remain.
// Produces a transparent PNG reused by both the favicon and the share image.
function makeTransparentLogo() {
  execFileSync("magick", [
    SRC,
    "-fuzz",
    "12%",
    "-transparent",
    "white",
    TMP_TRANS,
  ]);
}

async function buildFavicon() {
  // Crop the peace-hand from the transparent logo, add padding -> square master.
  const master = await sharp(TMP_TRANS)
    .extract(HAND)
    .extend({
      top: HAND_PAD,
      bottom: HAND_PAD,
      left: HAND_PAD,
      right: HAND_PAD,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // App icon: transparent background (looks right on light + dark browser tabs).
  await sharp(master).resize(512, 512).png().toFile(join(APP, "icon.png"));

  // Apple touch icons should not be transparent -> flatten onto brand paper.
  await sharp(master)
    .resize(180, 180)
    .flatten({ background: PAPER })
    .png()
    .toFile(join(APP, "apple-icon.png"));

  // Multi-resolution favicon.ico via ImageMagick (transparent).
  const sizes = [16, 32, 48];
  const tmp = [];
  for (const s of sizes) {
    const p = join(APP, `.fav-${s}.png`);
    await sharp(master).resize(s, s).png().toFile(p);
    tmp.push(p);
  }
  const icoOut = join(APP, "favicon.ico");
  execFileSync("magick", [...tmp, icoOut]);
  tmp.forEach((p) => existsSync(p) && rmSync(p));
  console.log("favicon: app/favicon.ico, app/icon.png, app/apple-icon.png");
}

async function buildShareImage() {
  const W = 1200;
  const H = 630;
  const maxW = 960; // logo fits inside this box, centered
  const maxH = 320;

  const logo = await sharp(TMP_TRANS)
    .trim() // strip the now-transparent border
    .resize(maxW, maxH, { fit: "inside", withoutEnlargement: false })
    .toBuffer();

  const canvas = sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: PAPER,
    },
  }).composite([{ input: logo, gravity: "center" }]);

  await canvas.clone().png().toFile(join(APP, "opengraph-image.png"));
  await canvas.clone().png().toFile(join(APP, "twitter-image.png"));
  console.log("share: app/opengraph-image.png, app/twitter-image.png");
}

makeTransparentLogo();
await buildFavicon();
await buildShareImage();
if (existsSync(TMP_TRANS)) rmSync(TMP_TRANS);
console.log("Done.");
