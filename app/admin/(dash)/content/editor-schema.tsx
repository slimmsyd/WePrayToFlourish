import type { ReactNode } from "react";
import type { SiteContent } from "@/lib/content";

export type Path = (string | number)[];

export type FieldMeta = {
  label: string;
  help?: string;
};

export type EditorSection = {
  id: string;
  title: string;
  description: string;
  /** Top-level draft keys or nested paths under copy */
  paths: Path[];
  previewUrl: string;
  icon: ReactNode;
};

/** Humanize a key into a label fallback. */
export function humanize(key: string): string {
  if (typeof key !== "string") return String(key);
  const isMoney = key.endsWith("Cents");
  const base = key.replace(/Cents$/, "");
  const words = base
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .trim();
  const title = words.charAt(0).toUpperCase() + words.slice(1);
  return isMoney ? `${title} ($)` : title;
}

/** Dot-path string for label lookup. */
export function pathKey(path: Path): string {
  return path.map(String).join(".");
}

/** Read a value at a path in the draft. */
export function getAt(obj: unknown, path: Path): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string | number, unknown>)[p];
  }
  return cur;
}

/** Curated plain-English labels and help text keyed by dot-path. */
export const LABELS: Record<string, FieldMeta> = {
  // Sections toggles
  "sections.hero": { label: "Hero banner", help: "The full-screen opening section with headline and background slides." },
  "sections.art": { label: "Art marquee", help: "Scrolling Instagram-style image strip." },
  "sections.quote": { label: "Quote", help: "Featured quote from the book." },
  "sections.aboutBook": { label: "About the book", help: "Book description and add-to-cart area." },
  "sections.aboutAuthor": { label: "About the author", help: "Author bio, photo, and song links." },
  "sections.freeChapter": { label: "Free chapter signup", help: "Newsletter form to receive the first chapter." },
  "sections.community": { label: "Community", help: "Community service photos and copy." },

  // Commerce
  "commerce.currency": { label: "Currency", help: "Three-letter code, e.g. usd. Used by Stripe." },
  "commerce.shipFlatCents": { label: "Standard shipping fee", help: "Flat shipping charge added at checkout (in dollars)." },
  "commerce.freeShipThresholdCents": { label: "Free shipping on orders over", help: "Orders at or above this amount ship free." },
  "commerce.taxRate": { label: "Tax rate", help: "Decimal rate applied at checkout (0 = no tax)." },

  // Products
  "products": { label: "Books & products" },
  "products.id": { label: "Product ID", help: "Unique slug used in cart and orders. No spaces." },
  "products.featured": { label: "Featured product", help: "Only one product can be featured. It drives the hero, footer, and newsletter." },
  "products.title": { label: "Book title" },
  "products.author": { label: "Author name" },
  "products.format": { label: "Format", help: "e.g. Paperback, Hardcover" },
  "products.priceCents": { label: "Price", help: "What customers pay — this is exactly what Stripe charges." },
  "products.maxQty": { label: "Max quantity per order" },
  "products.coverImage": { label: "Cover image" },
  "products.coverAlt": { label: "Cover image description", help: "Describes the cover for screen readers." },
  "products.hoverVideo": { label: "Hover video", help: "Short video that plays when hovering the cover." },
  "products.tagline": { label: "Tagline" },
  "products.shortDescription": { label: "Short description" },
  "products.longDescription": { label: "Full description paragraphs" },
  "products.tags": { label: "Tags" },

  // Brand
  "brand.siteName": { label: "Site name" },
  "brand.domain": { label: "Domain" },
  "brand.logo": { label: "Logo" },
  "brand.logoAlt": { label: "Logo description", help: "For screen readers." },

  // Nav / footer / social
  "nav": { label: "Navigation links" },
  "nav.href": { label: "Link URL", help: "Use #book, #author, etc. for on-page sections." },
  "nav.label": { label: "Link text" },
  "footer.links": { label: "Footer links" },
  "social": { label: "Social links" },
  "social.label": { label: "Platform name" },
  "social.href": { label: "Profile URL" },

  // Hero
  "copy.hero.headline": { label: "Headline lines", help: "Each line appears on its own row." },
  "copy.hero.slides": { label: "Background slides", help: "Images that cross-fade behind the headline." },
  "copy.hero.primaryCta.label": { label: "Primary button text" },
  "copy.hero.primaryCta.href": { label: "Primary button link" },
  "copy.hero.secondaryCta.label": { label: "Secondary button text" },
  "copy.hero.secondaryCta.href": { label: "Secondary button link" },
  "copy.hero.overlay": { label: "Overlay darkness", help: "0 = transparent, 1 = fully dark. Default 0.55." },
  "copy.hero.intervalMs": { label: "Slide interval (ms)", help: "Time between background slide changes." },

  // Art
  "copy.art.label": { label: "Section label", help: "Small label above the art marquee." },

  // Quote
  "copy.quote.eyebrow": { label: "Eyebrow" },
  "copy.quote.text": { label: "Quote text" },
  "copy.quote.highlight": { label: "Highlighted phrase", help: "Shown in gold at the end of the quote." },
  "copy.quote.attribution": { label: "Attribution" },

  // About book
  "copy.aboutBook.eyebrow": { label: "Eyebrow" },
  "copy.aboutBook.headline": { label: "Headline" },
  "copy.aboutBook.metaLine": { label: "Meta line" },
  "copy.aboutBook.ctaLabel": { label: "Add to cart button" },

  // About author
  "copy.aboutAuthor.eyebrow": { label: "Eyebrow" },
  "copy.aboutAuthor.headline": { label: "Headline" },
  "copy.aboutAuthor.metaLine": { label: "Meta line" },
  "copy.aboutAuthor.body": { label: "Bio paragraphs" },
  "copy.aboutAuthor.image": { label: "Author photo" },
  "copy.aboutAuthor.imageAlt": { label: "Photo description" },
  "copy.aboutAuthor.cta.label": { label: "Button text" },
  "copy.aboutAuthor.cta.href": { label: "Button link" },
  "copy.aboutAuthor.songsLabel": { label: "Songs section label" },
  "copy.aboutAuthor.songs": { label: "Song links" },
  "copy.aboutAuthor.songs.label": { label: "Song title" },
  "copy.aboutAuthor.songs.href": { label: "Song URL" },

  // Free chapter
  "copy.freeChapter.eyebrow": { label: "Eyebrow" },
  "copy.freeChapter.headline": { label: "Headline" },
  "copy.freeChapter.body": { label: "Description" },
  "copy.freeChapter.placeholder": { label: "Email field placeholder" },
  "copy.freeChapter.submitLabel": { label: "Submit button" },
  "copy.freeChapter.successTitle": { label: "Success title" },
  "copy.freeChapter.successBody": { label: "Success message" },
  "copy.freeChapter.finePrint": { label: "Fine print" },
  "copy.freeChapter.emails.welcome.subject": { label: "Welcome email subject" },
  "copy.freeChapter.emails.welcome.headline": { label: "Welcome email headline" },
  "copy.freeChapter.emails.welcome.body": { label: "Welcome email body" },
  "copy.freeChapter.emails.welcome.signOff": { label: "Welcome email sign-off" },
  "copy.freeChapter.emails.welcome.footer": { label: "Welcome email footer" },
  "copy.freeChapter.emails.admin.subject": { label: "Admin alert subject" },
  "copy.freeChapter.emails.admin.headline": { label: "Admin alert headline" },
  "copy.freeChapter.emails.admin.body": { label: "Admin alert body" },

  // Community
  "copy.community.eyebrow": { label: "Eyebrow" },
  "copy.community.headline": { label: "Headline" },
  "copy.community.body": { label: "Description" },
  "copy.community.photos": { label: "Photos" },
  "copy.community.photos.caption": { label: "Caption" },
  "copy.community.photos.image": { label: "Photo" },

  // Checkout
  "copy.checkout.pageTitle": { label: "Page title" },
  "copy.checkout.summaryItemNote": { label: "Order summary note" },
  "copy.checkout.successTitle": { label: "Success title" },
  "copy.checkout.successBody": { label: "Success message" },
  "copy.checkout.securityNote": { label: "Security note", help: "Shown under the Pay button." },
  "copy.checkout.shippingNote": { label: "Shipping note", help: "Prefix before the free-shipping amount." },
  "copy.checkout.emails.customer.subject": { label: "Customer receipt subject" },
  "copy.checkout.emails.customer.headline": { label: "Customer receipt headline" },
  "copy.checkout.emails.customer.body": { label: "Customer receipt body" },
  "copy.checkout.emails.customer.signOff": { label: "Customer receipt sign-off" },
  "copy.checkout.emails.customer.footer": { label: "Customer receipt footer" },
  "copy.checkout.emails.admin.subject": { label: "Admin order alert subject" },
  "copy.checkout.emails.admin.headline": { label: "Admin order alert headline" },
  "copy.checkout.emails.admin.body": { label: "Admin order alert body" },

  // SEO
  "seo.title": { label: "Browser tab title" },
  "seo.description": { label: "Search description" },
  "seo.ogTitle": { label: "Social share title" },
  "seo.ogDescription": { label: "Social share description" },
};

export function getFieldMeta(path: Path): FieldMeta {
  const key = pathKey(path);
  const meta = LABELS[key];
  if (meta) return meta;
  const lastKey = String(path[path.length - 1] ?? "");
  return { label: humanize(lastKey) };
}

/** Friendly add-button labels for array fields. */
export const ADD_LABELS: Record<string, string> = {
  products: "+ Add another book",
  headline: "+ Add headline line",
  slides: "+ Add slide",
  longDescription: "+ Add paragraph",
  tags: "+ Add tag",
  body: "+ Add paragraph",
  songs: "+ Add song",
  photos: "+ Add photo",
  nav: "+ Add link",
  "footer.links": "+ Add footer link",
  social: "+ Add social link",
};

export function getAddLabel(path: Path): string {
  const key = pathKey(path);
  if (ADD_LABELS[key]) return ADD_LABELS[key];
  const last = String(path[path.length - 1] ?? "");
  if (ADD_LABELS[last]) return ADD_LABELS[last];
  return "+ Add";
}

// ── Icons (inline SVG, 20×20) ─────────────────────────────────

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const icons = {
  sections: <Icon d="M4 6h16M4 12h16M4 18h10" />,
  products: <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V6H6.5A2.5 2.5 0 0 0 4 8.5v11z" />,
  commerce: <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  hero: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  art: <Icon d="M2 12h20M12 2v20" />,
  quote: <Icon d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />,
  aboutBook: <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6 2v15" />,
  aboutAuthor: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  freeChapter: <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />,
  community: <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  checkout: <Icon d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />,
  brandNav: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  seo: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  more: <Icon d="M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />,
};

export const EDITOR_SECTIONS: EditorSection[] = [
  {
    id: "sections",
    title: "Site sections",
    description: "Show or hide each section on the homepage.",
    paths: [["sections"]],
    previewUrl: "/",
    icon: icons.sections,
  },
  {
    id: "products",
    title: "The book",
    description: "Title, author, cover, price, and descriptions.",
    paths: [["products"]],
    previewUrl: "/#book",
    icon: icons.products,
  },
  {
    id: "commerce",
    title: "Pricing & shipping",
    description: "Shipping fees, free-shipping threshold, and tax.",
    paths: [["commerce"]],
    previewUrl: "/checkout",
    icon: icons.commerce,
  },
  {
    id: "hero",
    title: "Hero",
    description: "Opening banner — headline, slides, and buttons.",
    paths: [["copy", "hero"]],
    previewUrl: "/",
    icon: icons.hero,
  },
  {
    id: "art",
    title: "Art marquee",
    description: "Instagram-style scrolling image strip.",
    paths: [["copy", "art"]],
    previewUrl: "/#art",
    icon: icons.art,
  },
  {
    id: "quote",
    title: "Quote",
    description: "Featured quote from the book.",
    paths: [["copy", "quote"]],
    previewUrl: "/#book",
    icon: icons.quote,
  },
  {
    id: "aboutBook",
    title: "About the book",
    description: "Book section copy and call-to-action.",
    paths: [["copy", "aboutBook"]],
    previewUrl: "/#book",
    icon: icons.aboutBook,
  },
  {
    id: "aboutAuthor",
    title: "About the author",
    description: "Author bio, photo, and song links.",
    paths: [["copy", "aboutAuthor"]],
    previewUrl: "/#author",
    icon: icons.aboutAuthor,
  },
  {
    id: "freeChapter",
    title: "Free chapter",
    description: "Newsletter signup and welcome emails.",
    paths: [["copy", "freeChapter"]],
    previewUrl: "/#chapter",
    icon: icons.freeChapter,
  },
  {
    id: "community",
    title: "Community",
    description: "Community service section and photos.",
    paths: [["copy", "community"]],
    previewUrl: "/#community",
    icon: icons.community,
  },
  {
    id: "checkout",
    title: "Checkout & emails",
    description: "Checkout page copy and order confirmation emails.",
    paths: [["copy", "checkout"]],
    previewUrl: "/checkout",
    icon: icons.checkout,
  },
  {
    id: "brandNav",
    title: "Brand & navigation",
    description: "Site name, logo, nav links, footer, and social.",
    paths: [["brand"], ["nav"], ["footer"], ["social"]],
    previewUrl: "/",
    icon: icons.brandNav,
  },
  {
    id: "seo",
    title: "SEO & sharing",
    description: "Browser tab title and social preview text.",
    paths: [["seo"]],
    previewUrl: "/",
    icon: icons.seo,
  },
];

/** Top-level keys covered by curated sections. */
const COVERED_TOP_KEYS = new Set(
  EDITOR_SECTIONS.flatMap((s) => s.paths.map((p) => String(p[0]))),
);

/** Build a "More" section for any unmapped top-level keys. */
export function buildMoreSection(draft: SiteContent): EditorSection | null {
  const extras = Object.keys(draft as Record<string, unknown>).filter(
    (k) => !COVERED_TOP_KEYS.has(k),
  );
  if (extras.length === 0) return null;
  return {
    id: "more",
    title: "More",
    description: "Additional site settings.",
    paths: extras.map((k) => [k]),
    previewUrl: "/",
    icon: icons.more,
  };
}

export function getAllSections(draft: SiteContent): EditorSection[] {
  const more = buildMoreSection(draft);
  return more ? [...EDITOR_SECTIONS, more] : [...EDITOR_SECTIONS];
}

/** Which section owns a given path (for dirty tracking). */
export function sectionForPath(path: Path, sections: EditorSection[]): string {
  const top = String(path[0] ?? "");
  const copyKey = top === "copy" && path.length > 1 ? String(path[1]) : null;

  for (const s of sections) {
    for (const sp of s.paths) {
      if (sp.length === 1 && sp[0] === top && !copyKey) return s.id;
      if (sp.length === 2 && sp[0] === "copy" && sp[1] === copyKey) return s.id;
    }
  }
  return "more";
}

/** Compare two values deeply (JSON-safe). */
export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Check if a section's data differs from baseline. */
export function isSectionDirty(
  section: EditorSection,
  draft: SiteContent,
  baseline: SiteContent,
): boolean {
  for (const p of section.paths) {
    if (!deepEqual(getAt(draft, p), getAt(baseline, p))) return true;
  }
  return false;
}
