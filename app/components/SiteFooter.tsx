import { getSiteContent } from "@/lib/content";

export default async function SiteFooter() {
  const site = await getSiteContent();
  const footerLinks = site.footer.links;
  return (
    <footer className="bg-paper px-[clamp(24px,6vw,96px)] pt-[clamp(48px,8vh,80px)] pb-9">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-end justify-between gap-8 border-b border-ink/[0.14] pb-9">
        <div className="flex flex-col gap-[6px]">
          <span className="font-display text-[clamp(24px,3vw,34px)] font-normal tracking-[-0.02em] text-ink">
            {site.product.title}
          </span>
          <span className="text-[13px] uppercase tracking-[0.18em] text-gold">
            by {site.product.author}
          </span>
        </div>
        <div className="flex gap-[clamp(20px,3vw,40px)]">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1180px] flex-wrap justify-between gap-3 text-[13px] text-muted">
        <span>&copy; 2026 {site.product.author} &middot; All rights reserved</span>
        <span>{site.brand.domain}</span>
      </div>
    </footer>
  );
}
