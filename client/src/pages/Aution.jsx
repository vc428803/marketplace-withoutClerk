
import { apiUrl } from "../config/api";
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const FRAME_URL =
  "/nexelyth/auction/nexelyth-auction-card-frame.png";

const DEMO_ITEMS = Array.from({ length: 6 }, (_, index) => ({
  id: `demo-${index + 1}`,
  src: "",
  alt: `測試競拍商品 ${index + 1}`,
  currentPrice: (index + 1) * 10000,
  isDemo: true,
}));

// 旋轉木馬設定
const ORBIT_RADIUS_X = 420;
const ORBIT_RADIUS_Z = 260;
const ROTATION_SPEED = 12; // 每秒旋轉角度
const DEG_TO_RAD = Math.PI / 180;

function AuctionCard({ item }) {
  const content = (
    <div className="relative h-full w-full select-none">
      {item.src && (
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          className="absolute left-[15%] top-[13%] z-0 h-[52%] w-[70%] object-contain"
        />
      )}

      <img
        src={FRAME_URL}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full object-fill"
      />

      <div className="absolute bottom-[24%] left-[14%] right-[14%] z-20 truncate text-center text-xs font-semibold text-amber-100">
        {item.alt}
      </div>

      <div className="absolute bottom-[10%] left-[17%] z-20 text-[11px] font-semibold text-amber-300">
        {Number(item.currentPrice || 0).toLocaleString()}
      </div>
    </div>
  );

  return item.isDemo ? (
    content
  ) : (
    <Link
      to="/auctions/$id"
      params={{ id: String(item.id) }}
      className="block h-full w-full"
    >
      {content}
    </Link>
  );
}

function Aution() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const rotationRef = useRef(0);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(apiUrl("/auctions"), {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("failed to fetch auctions");
        }

        const data = await res.json();
        setListings(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("fetch auctions error:", err);
        setError("Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const items =
    listings.length > 0
      ? listings.map((listing) => ({
          id: listing.id,
          src: listing.item_image_url,
          alt: listing.item_name,
          currentPrice: listing.current_price,
          isDemo: false,
        }))
      : DEMO_ITEMS;

  const total = items.length;

  // 連續旋轉動畫
  useEffect(() => {
    if (loading || error || isPaused || isHovered || total <= 1) {
      return;
    }

    let frameId;
    let lastTime = null;

    const animate = (timestamp) => {
      if (lastTime === null) {
        lastTime = timestamp;
      }

      const delta = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      rotationRef.current =
        (rotationRef.current + delta * ROTATION_SPEED) % 360;

      setRotation(rotationRef.current);

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [loading, error, isPaused, isHovered, total]);

  const rotateManually = (direction) => {
    rotationRef.current =
      (rotationRef.current + direction * (360 / total) + 360) % 360;

    setRotation(rotationRef.current);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050d19] pt-24 text-center text-cyan-200">
        正在載入競拍商品...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050d19] pt-24 text-center text-red-400">
        {error}
      </div>
    );
  }

 
return (
  <main
    className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-[#050d19] text-white"
  >
    {/* 競拍殿堂背景 */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(3,10,22,0.12),rgba(3,10,22,0.25)), url('/nexelyth/auction/nexelyth-auction-hall-bg.png')",
      }}
    />

    {/* 頁面標題 */}
    <header className="relative z-20 shrink-0 pt-12 text-center">
      <p className="text-xs tracking-[0.35em] text-cyan-300">
        NEXELYTH AUCTION HOUSE
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-widest text-amber-100">
        冒險者競拍殿堂
      </h1>

      <p className="mt-3 text-sm text-slate-300">
        探索珍稀收藏，尋找屬於你的戰利品
      </p>
    </header>

    {/* 旋轉木馬區域 */}
    <section
      className="relative mx-auto mt-4 h-[470px] w-full max-w-[1400px] shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 [perspective:1200px]">
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {items.map((item, index) => {
            const angle = (360 / total) * index + rotation;
            const radians = angle * DEG_TO_RAD;

            const x = Math.sin(radians) * ORBIT_RADIUS_X;
            const z = Math.cos(radians) * ORBIT_RADIUS_Z;

            const depth = (Math.cos(radians) + 1) / 2;
            const brightness = 0.55 + depth * 0.45;

            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 h-[300px] w-[220px] [transform-style:preserve-3d]"
                style={{
                  transform: `
                    translate(-50%, -50%)
                    translate3d(${x}px, 0px, ${z}px)
                  `,
                  zIndex: Math.round(
                    (z + ORBIT_RADIUS_Z) * 10
                  ),
                  filter: `brightness(${brightness})`,
                  willChange: "transform",
                }}
              >
                <AuctionCard item={item} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 左右旋轉按鈕 */}
      <button
        type="button"
        onClick={() => rotateManually(-1)}
        aria-label="向左旋轉"
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-cyan-700 bg-[#10253d] p-3 text-cyan-300 hover:border-amber-400 md:left-10"
      >
        <ChevronLeft size={26} />
      </button>

      <button
        type="button"
        onClick={() => rotateManually(1)}
        aria-label="向右旋轉"
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-cyan-700 bg-[#10253d] p-3 text-cyan-300 hover:border-amber-400 md:right-10"
      >
        <ChevronRight size={26} />
      </button>
    </section>

    {/* 控制列：固定在木馬下方，不再靠右 */}
    <footer className="relative z-30 flex shrink-0 flex-col items-center gap-3 pb-8">
      <button
        type="button"
        onClick={() => setIsPaused((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-700 bg-[#10253d]/90 px-5 py-2 text-sm text-cyan-200 hover:border-amber-400"
      >
        {isPaused ? <Play size={16} /> : <Pause size={16} />}
        {isPaused ? "繼續旋轉" : "暫停旋轉"}
      </button>

      {listings.length === 0 && (
        <p className="text-xs text-slate-300">
          展示模式 · 目前尚無正式競拍商品
        </p>
      )}
    </footer>
  </main>
);

}

export default Aution;

export const Route = createFileRoute("/Aution")({
  component: Aution,
});
