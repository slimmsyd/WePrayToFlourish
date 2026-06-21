import { promises as fs } from "node:fs";
import path from "node:path";
import { getSiteContent } from "@/lib/content";
import ArtMarquee, { type Tile } from "./ArtMarquee";

type IgPost = {
  shortCode: string;
  postUrl?: string;
  caption?: string;
  timestamp?: string;
  files: string[];
};

async function getTiles(profile: string, siteName: string): Promise<Tile[]> {
  const fallbackAlt = `Instagram post by ${siteName}`;
  try {
    const file = path.join(
      process.cwd(),
      "public/assets/instagram/manifest.json"
    );
    const data = JSON.parse(await fs.readFile(file, "utf8")) as {
      posts?: IgPost[];
    };
    const posts = [...(data.posts ?? [])].sort((a, b) =>
      (b.timestamp ?? "").localeCompare(a.timestamp ?? "")
    );
    return posts.flatMap((p) =>
      (p.files ?? []).map((f) => ({
        src: `/assets/instagram/${f}`,
        href: p.postUrl || profile,
        alt: (p.caption || fallbackAlt).split("\n")[0].slice(0, 120) || fallbackAlt,
      }))
    );
  } catch {
    return [];
  }
}

export default async function ArtCarousel() {
  const site = await getSiteContent();
  const profile =
    site.social.find((s) => s.label.toLowerCase() === "instagram")?.href ??
    site.social[0]?.href ??
    "#";
  const tiles = await getTiles(profile, site.brand.siteName);
  if (tiles.length === 0) return null;

  return (
    <section
      id="art"
      className="bg-paper pt-[clamp(24px,4vh,44px)] pb-[clamp(28px,5vh,56px)]"
    >
      {/* Fixed label — stays in place while the gallery drifts below it */}
      <div className="mb-[14px] px-[clamp(24px,6vw,96px)]">
        <a
          href={profile}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-[8px] font-display text-[12px] font-semibold uppercase tracking-[0.3em] text-ink transition-colors hover:text-gold"
        >
          Instagram <span className="font-normal">&#8599;</span>
        </a>
      </div>

      <ArtMarquee tiles={tiles} />
    </section>
  );
}
