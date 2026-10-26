
import { apiUrl } from "../config/api";
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Coins,
  Hourglass,
} from "lucide-react";

type AuctionListing = {
  id: string;
  item_name: string;
  item_image_url: string;
  current_price: number;
  end_time: string;
};

type AuctionResponse = {
  data: AuctionListing[];
};

type AuctionCardItem = {
  id: string;
  src: string;
  alt: string;
  currentPrice: number;
  endTime: string | null;
  isDemo: boolean;
};

type AuctionCardProps = {
  item: AuctionCardItem;
  now: number;
};


const AZURE_SWORD_IMAGE =
  "/nexelyth/items/weapons/nexelyth-azure-knight-sword.png";

// 暫時用於 Prototype，未來改由雲端 image_url 提供
function resolveAuctionImage(listing: AuctionListing): string {
  if (listing.item_image_url) {
    return listing.item_image_url;
  }

  if (listing.item_name === "蒼藍騎士劍") {
    return AZURE_SWORD_IMAGE;
  }

  return "";
}

const FRAME_URL =
  "/nexelyth/auction/nexelyth-auction-card-frame.png";

const DEMO_ITEMS: AuctionCardItem[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: `demo-${index + 1}`,
    src: "",
    alt: `測試競拍商品 ${index + 1}`,
    currentPrice: (index + 1) * 10000,
    endTime: null,
    isDemo: true,
  }),
);

// 旋轉木馬設定
const ORBIT_RADIUS_X = 420;
const ORBIT_RADIUS_Z = 260;
const ROTATION_SPEED = 12; // 每秒旋轉角度
const DEG_TO_RAD = Math.PI / 180;


function formatRemainingTime(
  endTime: string | null,
  now: number,
): string {
  if (!endTime) return "--";

  const end = new Date(endTime).getTime();

  if (!Number.isFinite(end)) return "--";

  const remaining = Math.max(
    0,
    Math.floor((end - now) / 1000),
  );

  if (remaining === 0) return "已結束";

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m ${seconds}s`;
}



function AuctionCard({ item, now }: AuctionCardProps) {
  const content = (
    <div className="relative h-full w-full select-none">

      {/* 金藍卡框：底層 */}
      <img
        src={FRAME_URL}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-fill"
      />

      {/* 只有真實商品且有圖片時才顯示 */}
      {!item.isDemo && item.src && (
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          className="pointer-events-none absolute left-[18%] top-[12%] z-10 h-[57%] w-[64%] object-contain"
        />
      )}

      {/* 物品名稱：置中在卡框名稱橫條 */}
      <div className="pointer-events-none absolute bottom-[25.5%] left-[14%] right-[14%] z-20 flex h-[7%] items-center justify-center">
        <span className="block w-full truncate text-center text-[12px] font-bold leading-none text-amber-100 drop-shadow-[0_1px_3px_#000]">
          {item.alt}
        </span>
      </div>


      {/* 卡片底部：價格與倒數時間 */}
      <div className="pointer-events-none absolute bottom-[16.5%] left-[24%] right-[13%] z-20 grid h-[6%] grid-cols-[1.6fr_1fr] items-center gap-2">
        {/* 左側：目前出價 */}
        <div className="min-w-0 text-center">
          <span className="block truncate text-[11px] font-bold tabular-nums leading-none text-amber-200">
            {item.currentPrice.toLocaleString()}
          </span>
        </div>

        {/* 右側：剩餘時間 */}
        <div className="min-w-0 text-center">
          <span className="block whitespace-nowrap text-[9px] font-bold tabular-nums leading-none text-red-400">
            {formatRemainingTime(item.endTime, now)}
          </span>
        </div>
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
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [now, setNow] = useState<number>(() => Date.now());


  const rotationRef = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);


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

        const data: AuctionResponse = await res.json();

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

  const realItems: AuctionCardItem[] = listings.map((listing) => ({
    id: listing.id,
    src: resolveAuctionImage(listing),
    alt: listing.item_name,
    currentPrice: listing.current_price,
    endTime: listing.end_time,
    isDemo: false,
  }));

  const emptyCount = Math.max(0, 6 - realItems.length);

  const emptyItems: AuctionCardItem[] = Array.from(
    { length: emptyCount },
    (_, index) => ({
      id: `demo-empty-${index}`,
      src: "",
      alt: "",
      currentPrice: 0,
      endTime: null,
      isDemo: true,
    }),
  );

  const items: AuctionCardItem[] = [...realItems, ...emptyItems];

  const total = items.length;

  // 連續旋轉動畫
  useEffect(() => {
    if (loading || error || isPaused || isHovered || total <= 1) {
      return;
    }

    let frameId: number;
    let lastTime: number | null = null;

    const animate = (timestamp: number) => {
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

  const rotateManually = (direction: number) => {
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
                  <AuctionCard item={item} now={now} />
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
