import type { Metadata } from "next";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: "Checkout — 52 Laws of You",
  description: "Complete your order for 52 Laws of You by Yaddin.",
};

export default function CheckoutPage() {
  return <Checkout />;
}
