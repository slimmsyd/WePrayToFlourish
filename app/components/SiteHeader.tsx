import Image from "next/image";

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
              href="mailto:hello@wepray2flourish.net"
              aria-label="Email"
              className="inline-flex text-ink transition-colors hover:text-gold"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              className="inline-flex text-ink transition-colors hover:text-gold"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.3-1.4 1.5-1.4h1.4V5.5c-.7-.1-1.5-.2-2.3-.2-2.3 0-3.9 1.4-3.9 4v2.2H7.8V14h2.3v7h3.4z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/"
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
            <a
              href="#book"
              aria-label="Cart"
              className="inline-flex text-ink transition-colors hover:text-gold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M2 3h2.2l2.3 12.2a1.2 1.2 0 0 0 1.2 1h8.9a1.2 1.2 0 0 0 1.2-.95L21 7.5H5.2" />
              </svg>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
