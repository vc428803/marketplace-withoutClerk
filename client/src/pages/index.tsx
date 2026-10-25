
import { createFileRoute } from "@tanstack/react-router";

import Carousel from "../components/Carousel.jsx";
import GuildExchangeSection from "../components/Home/GuildExchangeSection";

const slides: string[] = [
  "https://banner.gnjoy.com.tw/Uploads/a9980f2aeb9e488c90e5863f5f3b32ad.jpg",
  "https://banner.gnjoy.com.tw/Uploads/42601ff3dc914ad5bfa4f5ff4347170f.jpg",
  "https://banner.gnjoy.com.tw/Uploads/c884dcbb168b46629ea917f40b44ac00.jpg",
  "https://banner.gnjoy.com.tw/Uploads/8cee6b67c04e4ac98e15a2190601c03c.jpg",
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
