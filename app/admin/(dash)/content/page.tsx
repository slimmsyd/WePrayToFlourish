import { readdirSync, type Dirent } from "node:fs";
import path from "node:path";
import { getSiteContent } from "@/lib/content";
import ContentEditor from "./ContentEditor";

export const dynamic = "force-dynamic";

const IMG = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const VID = /\.(mp4|webm|mov)$/i;

// Shallow scan of /public for pickable media (one level into folders).
function listPublicAssets(): { images: string[]; videos: string[] } {
  const root = path.join(process.cwd(), "public");
  const images: string[] = [];
  const videos: string[] = [];
  const walk = (dir: string, prefix: string, depth: number) => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true }) as Dirent[];
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const rel = `${prefix}/${e.name}`;
      if (e.isDirectory()) {
        if (depth < 1) walk(path.join(dir, e.name), rel, depth + 1);
      } else if (IMG.test(e.name)) images.push(rel);
      else if (VID.test(e.name)) videos.push(rel);
    }
  };
  walk(root, "", 0);
  return { images: images.sort(), videos: videos.sort() };
}

export default async function AdminContentPage() {
  const site = await getSiteContent();
  const assets = listPublicAssets();

  return (
    <div className="flex flex-col gap-[clamp(20px,4vw,32px)]">
      <div className="flex flex-col gap-[6px]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">Content</span>
        <h1 className="m-0 font-display text-[clamp(26px,3.4vw,40px)] font-normal leading-[1.05] tracking-[-0.02em]">
          Edit your site
        </h1>
        <p className="m-0 max-w-[60ch] text-[14px] text-ink-soft">
          Every field on the site, editable. Changes publish on save. Prices are in
          dollars; the server charges exactly what you set here.
        </p>
      </div>
      <ContentEditor initial={site} assets={assets} />
    </div>
  );
}
