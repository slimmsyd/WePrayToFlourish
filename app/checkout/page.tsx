import type { Metadata } from "next";
import { getProductContent } from "@/lib/content";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: "Checkout — 52 Laws of You",
  description: "Complete your order for 52 Laws of You by Yaddin.",
};

export default async function CheckoutPage() {
  const product = await getProductContent();
  return <Checkout product={product} />;
}
