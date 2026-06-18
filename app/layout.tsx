import type { Metadata } from "next";
import { Schibsted_Grotesk, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart/CartContext";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://wepray2flourish.net"),
  title: "We Pray To Flourish — 52 Laws of You by Yaddin",
  description:
    "52 Laws of You is a year-long practice in becoming, for anyone learning to speak less, notice more, and flourish. A new book by Yaddin.",
  openGraph: {
    title: "We Pray To Flourish — 52 Laws of You",
    description:
      "A weekly practice in becoming. Read the first law free.",
    type: "website",
    url: "https://wepray2flourish.net",
  },
  twitter: {
    card: "summary_large_image",
    title: "We Pray To Flourish — 52 Laws of You",
    description: "A weekly practice in becoming. Read the first law free.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
