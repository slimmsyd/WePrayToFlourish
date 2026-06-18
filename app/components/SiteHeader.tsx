import Image from "next/image";
import CartButton from "./CartButton";

const navLinks = [
  { href: "#book", label: "The Book" },
  { href: "#author", label: "The Author" },
  { href: "#art", label: "Art" },
  { href: "#chapter", label: "Newsletter" },
];

export default function SiteHeader() {
  return (
    <div className="sticky top-0 z-50 border-b border-ink/10 bg-white">
      <nav className="mx-auto flex max-w-[1640px] items-center justify-between gap-5 px-[clamp(20px,4vw,56px)] py-[13px]">
        <a href="#top" className="flex shrink-0 items-center">
          <Image
            src="/logo.jpg"
            alt="We Pray to Flourish"
            width={184}
            height={46}
            priority
            className="h-[clamp(32px,3.6vw,46px)] w-auto"
          />
        </a>

        <div className="flex flex-wrap items-center justify-end gap-[clamp(16px,2.2vw,38px)]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap font-display text-[clamp(13px,1vw,15px)] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-[15px] pl-[clamp(4px,1vw,12px)] text-ink">
            <a
              href="https://www.instagram.com/wepray2flourish/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="inline-flex text-ink transition-colors hover:text-gold"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <CartButton />
          </div>
        </div>
      </nav>
    </div>
  );
}
