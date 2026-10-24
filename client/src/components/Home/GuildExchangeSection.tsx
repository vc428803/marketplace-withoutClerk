
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coins,
  Radio,
  ScrollText,
  Store,
  Swords,
} from "lucide-react";

import ProductNoticesSection from "./ProductNoticesSection";

export default function GuildExchangeSection() {
  return (
    <section
      className="
        relative isolate w-full overflow-hidden
        bg-[#06111e] bg-cover bg-center bg-no-repeat
        py-12 text-[#e9dfcb] md:py-20
      "
      style={{
        backgroundImage:
          "linear-gradient(180deg,rgba(3,10,20,.83),rgba(3,10,20,.72)),url('/nexelyth/auth/member-background.png')",
      }}
    >
      {/* 背景裝飾光暈 */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_at_50%_15%,rgba(24,106,158,.18),transparent_65%)]
        "
      />

      <div className="relative mx-auto max-w-[1350px] px-4 sm:px-6">
        {/* 標題 */}
        <header className="mb-9 text-center">
          <p className="text-xs tracking-[.32em] text-[#7dc9ed]">
            NEXELYTH MARKETPLACE
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-wider text-[#f0d19a] md:text-4xl">
            冒險者交易公會
          </h2>

          <p className="mt-3 text-sm text-[#b6c5d1]">
            探索冒險者的交易情報，尋找屬於你的裝備與收藏
          </p>
        </header>

        {/* 主要雙欄區塊 */}
        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* 左：公會情報欄 */}
          <article
            className="
              overflow-hidden rounded-xl
              border border-[#a7844e]/65
              bg-[#091b2c]/95
              shadow-[0_18px_55px_rgba(0,0,0,.45)]
            "
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#896b43]/60 bg-[#122b43] px-5 py-5">
              <div className="flex items-center gap-3">
                <ScrollText className="text-[#e8c489]" size={27} />

                <div>
                  <h3 className="text-xl font-semibold text-[#f4d59d]">
                    公會情報欄
                  </h3>
                  <p className="mt-1 text-[11px] tracking-[.16em] text-[#90a8b9]">
                    GUILD INTELLIGENCE
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#8bc9e5]">
                <Radio size={16} />
                <span>交易即時情報</span>
              </div>
            </div>

            <div className="min-h-[260px] p-3 sm:p-5">
              {/* 完整保留既有 SSE 功能 */}
              <ProductNoticesSection />
            </div>
          </article>

          {/* 右：近期熱門交易 */}
          <article
            className="
              overflow-hidden rounded-xl
              border border-[#a7844e]/65
              bg-[#091b2c]/95
              shadow-[0_18px_55px_rgba(0,0,0,.45)]
            "
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#896b43]/60 bg-[#122b43] px-5 py-5">
              <div className="flex items-center gap-3">
                <Swords className="text-[#e8c489]" size={27} />

                <div>
                  <h3 className="text-xl font-semibold text-[#f4d59d]">
                    近期熱門交易
                  </h3>
                  <p className="mt-1 text-[11px] tracking-[.16em] text-[#90a8b9]">
                    MARKETPLACE LISTINGS
                  </p>
                </div>
              </div>

              <Link
                to="/marketplace"
                className="flex items-center gap-1 text-sm text-[#8bc9e5] transition hover:text-white"
              >
                查看交易市集
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* 尚未串接刊登 API：不顯示虛構商品 */}
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-5 flex size-20 items-center justify-center rounded-xl border border-[#536b83] bg-[#102b44] shadow-[0_0_30px_rgba(35,139,212,.12)]">
                <Store size={34} className="text-[#8bcbeb]" />
              </div>

              <h4 className="text-lg font-semibold text-[#ecd2a3]">
                交易委託板準備中
              </h4>

              <p className="mt-3 max-w-sm text-sm leading-7 text-[#a6bacb]">
                冒險者刊登的裝備與物品，
                未來將顯示於此。
              </p>

              <div className="mt-5 flex items-center gap-2 text-[#e4bf78]">
                <Coins size={18} />
                <span className="text-sm">使用遊戲幣 G 進行交易</span>
              </div>

              <Link
                to="/marketplace"
                className="
                  mt-7 inline-flex items-center gap-2
                  rounded-md border border-[#75c9f5]/70
                  bg-gradient-to-b from-[#155784] to-[#092c4b]
                  px-6 py-3 text-sm font-semibold text-[#e9f7ff]
                  shadow-[0_0_20px_rgba(35,146,221,.15)]
                  transition hover:brightness-125
                "
              >
                前往交易市集
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        </div>

        <footer className="mt-9 flex items-center justify-center gap-3 text-xs tracking-[.15em] text-[#839caf]">
          <span className="h-px w-12 bg-[#8b764f]/50" />
          <span>MORE THAN A MARKET · A WORLD OF ADVENTURE</span>
          <span className="h-px w-12 bg-[#8b764f]/50" />
        </footer>
      </div>
    </section>
  );
}
