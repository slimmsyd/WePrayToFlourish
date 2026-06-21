import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import ArtCarousel from "./components/ArtCarousel";
import Quote from "./components/Quote";
import AboutBook from "./components/AboutBook";
import AboutAuthor from "./components/AboutAuthor";
import FreeChapter from "./components/FreeChapter";
import Community from "./components/Community";
import SiteFooter from "./components/SiteFooter";
import { getProductContent } from "@/lib/content";

export default async function WePrayToFlourish() {
  const product = await getProductContent();
  return (
    <>
      <SiteHeader />
      <Hero byline={`A new book by ${product.author}`} sub={product.shortDescription} />
      <ArtCarousel />
      <Quote />
      <AboutBook product={product} />
      <AboutAuthor />
      <FreeChapter />
      <Community />
      <SiteFooter />
    </>
  );
}
