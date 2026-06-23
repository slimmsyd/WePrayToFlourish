/**
 * site.config.ts — the default content for the whole site.
 *
 * This is the seed/fallback. When the CMS is on, the database holds the edited
 * version (merged over these defaults). Prices are in CENTS — the server (the
 * Stripe PaymentIntent route) is the only pricing authority.
 *
 * Slices that the product owns (book identity, description, price, cover) live
 * under `product`. Section labels + section-specific copy live under `copy`.
 * Hero byline/sub and the author name chip are DERIVED from `product` in the
 * components, so they are not duplicated here.
 */

export type NavLink = { href: string; label: string };
export type SocialLink = { label: string; href: string };

export type ProductContent = {
  title: string;
  author: string;
  format: string;
  priceCents: number;
  currency: string;
  shipFlatCents: number;
  freeShipThresholdCents: number;
  taxRate: number;
  maxQty: number;
  coverImage: string;
  coverAlt: string;
  hoverVideo: string;
  tagline: string;
  shortDescription: string;
  longDescription: string[];
  tags: string[];
};

export type SiteConfig = {
  sections: {
    hero: boolean;
    art: boolean;
    quote: boolean;
    aboutBook: boolean;
    aboutAuthor: boolean;
    freeChapter: boolean;
    community: boolean;
  };
  brand: {
    siteName: string;
    domain: string;
    logo: string;
    logoAlt: string;
  };
  product: ProductContent;
  nav: NavLink[];
  footer: { links: NavLink[] };
  social: SocialLink[];
  copy: {
    hero: {
      /** Headline lines — each renders on its own line. */
      headline: string[];
      /** Full-bleed cross-fade background slides from /public. */
      slides: string[];
      primaryCta: { label: string; href: string };
      secondaryCta: { label: string; href: string };
      /** Darkness of the gradient overlay (0–1). */
      overlay: number;
      /** Slide rotation interval in milliseconds. */
      intervalMs: number;
    };
    // Keep `art` an OBJECT. The admin editor's isImageKey() regex matches the
    // substring "art", so a string-typed `art` key would render as an image
    // uploader. Nested keys like `label` are safe.
    art: {
      /** Label above the Instagram art marquee. */
      label: string;
    };
    quote: {
      eyebrow: string;
      text: string;
      /** Highlighted clause appended to the quote (gold). */
      highlight: string;
      attribution: string;
    };
    aboutBook: {
      eyebrow: string;
      headline: string;
      metaLine: string;
      /** Add-to-cart button label. */
      ctaLabel: string;
    };
    aboutAuthor: {
      eyebrow: string;
      headline: string;
      metaLine: string;
      body: string[];
      image: string;
      imageAlt: string;
      cta: { label: string; href: string };
      songsLabel: string;
      songs: { label: string; href: string }[];
    };
    freeChapter: {
      eyebrow: string;
      headline: string;
      body: string;
      placeholder: string;
      submitLabel: string;
      successTitle: string;
      successBody: string;
      finePrint: string;
      /** Resend notification copy — editable in the admin CRM. */
      emails: {
        welcome: {
          subject: string;
          headline: string;
          body: string;
          signOff: string;
          footer: string;
        };
        admin: {
          subject: string;
          headline: string;
          body: string;
        };
      };
    };
    community: {
      eyebrow: string;
      headline: string;
      body: string;
      photos: { caption: string; image: string }[];
    };
    checkout: {
      /** Checkout page <h1>. */
      pageTitle: string;
      summaryItemNote: string;
      successTitle: string;
      successBody: string;
      /** Trust line under the Pay button. */
      securityNote: string;
      /** Shipping reassurance prefix; the "$X" amount is appended by the component. */
      shippingNote: string;
      /** Resend notification copy — editable in the admin CRM. */
      emails: {
        customer: {
          subject: string;
          headline: string;
          body: string;
          signOff: string;
          footer: string;
        };
        admin: {
          subject: string;
          headline: string;
          body: string;
        };
      };
    };
  };
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
};

export const site: SiteConfig = {
  sections: {
    hero: true,
    art: true,
    quote: true,
    aboutBook: true,
    aboutAuthor: true,
    freeChapter: true,
    community: true,
  },

  brand: {
    siteName: "We Pray To Flourish",
    domain: "wepray2flourish.net",
    logo: "/logo.jpg",
    logoAlt: "We Pray to Flourish",
  },

  product: {
    title: "52 Laws of You",
    author: "Yaadin",
    format: "Paperback",
    priceCents: 2400,
    currency: "usd",
    shipFlatCents: 500,
    freeShipThresholdCents: 4000,
    taxRate: 0,
    maxQty: 99,
    coverImage: "/book.png",
    coverAlt: "52 Laws of You, hardcover edition",
    hoverVideo: "/book-hover.mp4",
    tagline: "52 Laws of You",
    shortDescription:
      "52 Laws of You is the book Yaadin has ushered in: a weekly practice in becoming, for anyone learning to speak less, notice more, and flourish.",
    longDescription: [
      "52 Laws of You is a year-long practice in self-mastery. Each week offers a single law to read, sit with, and live. Small enough to begin today, deep enough to return to for a lifetime.",
      "Drawn from faith, observation, and the wisdom of community, it asks one question on every page: who are you becoming when no one is watching?",
    ],
    tags: ["#observe", "#restrain", "#flourish"],
  },

  nav: [
    { href: "#book", label: "The Book" },
    { href: "#author", label: "The Author" },
    { href: "#art", label: "Art" },
    { href: "#chapter", label: "Newsletter" },
  ],

  footer: {
    links: [
      { href: "#book", label: "The Book" },
      { href: "#author", label: "The Author" },
      { href: "#chapter", label: "Free Chapter" },
    ],
  },

  social: [
    { label: "Instagram", href: "https://www.instagram.com/wepray2flourish/" },
  ],

  copy: {
    hero: {
      headline: ["We Pray", "To Flourish"],
      slides: [
        "/FlourishAssets/hero.jpg",
        "/FlourishAssets/Asset1.jpg",
        "/FlourishAssets/Asset2.jpg",
        "/FlourishAssets/Asset3.jpg",
        "/FlourishAssets/Asset4.jpg",
        "/FlourishAssets/Asset5.jpg",
        "/FlourishAssets/Asset6.jpg",
        "/FlourishAssets/Asset7.jpg",
        "/FlourishAssets/Asset8.jpg",
      ],
      primaryCta: { label: "Get the first chapter free", href: "#chapter" },
      secondaryCta: { label: "Read about the book", href: "#book" },
      overlay: 0.55,
      intervalMs: 4000,
    },
    art: {
      label: "Instagram",
    },
    quote: {
      eyebrow: "From the book",
      text: "Speak less, and you’ll learn a lot about them,",
      highlight: "while they’ll know a little about you.",
      attribution: "Law 12 · 52 Laws of You",
    },
    aboutBook: {
      eyebrow: "The book",
      headline: "Fifty-two laws. One year of becoming.",
      metaLine: "A weekly practice · 52 chapters",
      ctaLabel: "Read the first law",
    },
    aboutAuthor: {
      eyebrow: "The author",
      headline: "Faith, philosophy, and the work of becoming.",
      metaLine: "Writer · Speak less, notice more",
      body: [
        "Yaadin writes at the intersection of faith, philosophy, and the everyday discipline of becoming a better person.",
        "His work invites readers to speak less, notice more, and build lives and communities that truly flourish.",
      ],
      image: "/AuthorPicture.jpg",
      imageAlt: "Portrait of Yaadin",
      cta: { label: "Get the first chapter free", href: "#chapter" },
      songsLabel: "Listen",
      songs: [
        { label: "Flourish", href: "#" },
        { label: "Speak Less", href: "#" },
        { label: "Patience", href: "#" },
        { label: "Moonlight", href: "#" },
        { label: "Becoming", href: "#" },
        { label: "Stillness", href: "#" },
        { label: "Community", href: "#" },
      ],
    },
    freeChapter: {
      eyebrow: "Free chapter",
      headline: "Read the first law, free.",
      body: "Join the list and we’ll send the opening chapter of 52 Laws of You straight to your inbox.",
      placeholder: "Your email address",
      submitLabel: "Send me the chapter",
      successTitle: "Thank you.",
      successBody: "Check your inbox. The first law is on its way.",
      finePrint: "No spam. One chapter, then occasional notes from Yaadin.",
      emails: {
        welcome: {
          subject: "Your first law is on its way",
          headline: "Thank you for signing up.",
          body: "You’re on the list. We’ll send the opening chapter of 52 Laws of You to this inbox shortly — the first law in a year-long practice of becoming.\n\nSmall enough to begin today. Deep enough to return to for a lifetime.",
          signOff: "With gratitude,\nYaadin",
          footer:
            "No spam. One chapter, then occasional notes from We Pray To Flourish. If you didn’t request this, you can ignore this email.",
        },
        admin: {
          subject: "New signup — free chapter list",
          headline: "Someone joined the list",
          body: "A new reader signed up for the free chapter. Their welcome email has been sent automatically and the address is saved to the newsletter list.",
        },
      },
    },
    community: {
      eyebrow: "Community service",
      headline: "The work beyond the page.",
      body: "Yaadin gives his time to the communities that shaped him: feeding programs, youth mentorship, and the quiet labor of simply showing up.",
      photos: [
        { caption: "Community gathering", image: "" },
        { caption: "Service day", image: "" },
        { caption: "Youth program", image: "" },
      ],
    },
    checkout: {
      pageTitle: "Complete your order",
      summaryItemNote: "Includes free first chapter",
      successTitle: "Thank you. Your order is in.",
      successBody:
        "A confirmation is on its way to your inbox. 52 Laws of You will ship shortly, and your free first chapter is included as a digital download.",
      securityNote: "Secure encrypted checkout, powered by Stripe.",
      shippingNote: "Free worldwide shipping over",
      emails: {
        customer: {
          subject: "Your order is confirmed",
          headline: "Thank you. Your order is in.",
          body: "We have received your order and are preparing your copy for shipping. A confirmation with your full order details is below.\n\nYour free first chapter is included with this purchase.",
          signOff: "With gratitude,\nYaadin",
          footer:
            "Questions about your order? Reply to this email and we will get back to you. If you did not place this order, please contact us right away.",
        },
        admin: {
          subject: "New order",
          headline: "New order received",
          body: "A customer has completed checkout. Fulfillment details are below. The order is also recorded in the admin CRM.",
        },
      },
    },
  },

  seo: {
    title: "We Pray To Flourish ~ 52 Laws of You by Yaadin",
    description:
      "52 Laws of You is a year-long practice in becoming, for anyone learning to speak less, notice more, and flourish. A new book by Yaadin.",
    ogTitle: "We Pray To Flourish",
    ogDescription:
      "52 Laws of You ~ A weekly practice in becoming. Read the first law free.",
  },
};

export default site;
