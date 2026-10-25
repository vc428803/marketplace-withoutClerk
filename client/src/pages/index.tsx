
import { createFileRoute } from "@tanstack/react-router";

import Carousel from "../components/Carousel";
import GuildExchangeSection from "../components/Home/GuildExchangeSection";

const slides: string[] = [
  "/nexelyth/banner/nexelyth-main.png",
  "/nexelyth/banner/opening-line-campaign.png",
];

function Home() {
  return (
    <main className="min-h-screen w-full bg-[#06111e]">
      {/* 首頁 Banner */}
      <section className="w-full">
        <Carousel slides={slides} />
      </section>

      {/* NEXELYTH 冒險者交易公會 */}
      <GuildExchangeSection />
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: Home,
});
