import SiteHeader from "./components/SiteHeader";
import Hero from "./components/Hero";
import ArtCarousel from "./components/ArtCarousel";
import Quote from "./components/Quote";
import AboutBook from "./components/AboutBook";
import AboutAuthor from "./components/AboutAuthor";
import FreeChapter from "./components/FreeChapter";
import Community from "./components/Community";
import SiteFooter from "./components/SiteFooter";

export default function WePrayToFlourish() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <ArtCarousel />
      <Quote />
      <AboutBook />
      <AboutAuthor />
      <FreeChapter />
      <Community />
      <SiteFooter />
    </>
  );
}
