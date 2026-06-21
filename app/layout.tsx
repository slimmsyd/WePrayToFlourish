import type { Metadata } from "next";
import { Schibsted_Grotesk, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart/CartContext";
import { SiteContentProvider } from "@/lib/site-content";
import { getSiteContent } from "@/lib/content";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://${site.brand.domain}`;
  return {
    metadataBase: new URL(siteUrl),
    title: site.seo.title,
    description: site.seo.description,
    openGraph: {
      title: site.seo.ogTitle,
      description: site.seo.ogDescription,
      type: "website",
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.ogTitle,
      description: site.seo.ogDescription,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSiteContent();
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteContentProvider content={site}>
          <CartProvider>{children}</CartProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
