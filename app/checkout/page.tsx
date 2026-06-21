import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import Checkout from "./Checkout";

export async function generateMetadata(): Promise<Metadata> {
  const { product } = await getSiteContent();
  return {
    title: `Checkout — ${product.title}`,
    description: `Complete your order for ${product.title} by ${product.author}.`,
  };
}

export default function CheckoutPage() {
  return <Checkout />;
}
