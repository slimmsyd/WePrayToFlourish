import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import Checkout from "./Checkout";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const featured =
    site.products.find((p) => p.featured) ?? site.products[0] ?? null;
  return {
    title: featured ? `Checkout — ${featured.title}` : "Checkout",
    description: featured
      ? `Complete your order for ${featured.title} by ${featured.author}.`
      : `Complete your order at ${site.brand.siteName}.`,
  };
}

export default function CheckoutPage() {
  return <Checkout />;
}
