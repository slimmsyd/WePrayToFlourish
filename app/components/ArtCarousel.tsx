import { promises as fs } from "node:fs";
import path from "node:path";
import ArtMarquee, { type Tile } from "./ArtMarquee";

const PROFILE = "https://www.instagram.com/wepray2flourish/";

type IgPost = {
  shortCode: string;
  postUrl?: string;
  caption?: string;
  timestamp?: string;
  files: string[];
};

async function getTiles(): Promise<Tile[]> {
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
        href: p.postUrl || PROFILE,
        alt:
          (p.caption || "Instagram post by We Pray To Flourish")
            .split("\n")[0]
            .slice(0, 120) || "Instagram post by We Pray To Flourish",
      }))
    );
  } catch {
    return [];
  }
}

export default async function ArtCarousel() {
  const tiles = await getTiles();
  if (tiles.length === 0) return null;

  return (
    <section
      id="art"
      className="bg-paper pt-[clamp(24px,4vh,44px)] pb-[clamp(28px,5vh,56px)]"
    >
      {/* Fixed label — stays in place while the gallery drifts below it */}
      <div className="mb-[14px] px-[clamp(24px,6vw,96px)]">
        <a
          href={PROFILE}
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
