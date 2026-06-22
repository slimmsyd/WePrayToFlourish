import { getSiteContent } from "@/lib/content";
import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import ArtCarousel from "./components/ArtCarousel";
import Quote from "./components/Quote";
import AboutBook from "./components/AboutBook";
import AboutAuthor from "./components/AboutAuthor";
import FreeChapter from "./components/FreeChapter";
import Community from "./components/Community";
import SiteFooter from "./components/SiteFooter";

export default async function WePrayToFlourish() {
  const { sections } = await getSiteContent();
  return (
    <>
      <SiteHeader />
      {sections.hero && <Hero />}
      {sections.art && <ArtCarousel />}
      {sections.quote && <Quote />}
      {sections.aboutBook && <AboutBook />}
      {sections.aboutAuthor && <AboutAuthor />}
      {sections.freeChapter && <FreeChapter />}
      {sections.community && <Community />}
      <SiteFooter />
    </>
  );
}
