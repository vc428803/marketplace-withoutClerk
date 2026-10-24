import { apiUrl } from "../config/api";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth-context-def";
import { createFileRoute } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import Hero from "../components/Hero";
import LatestListing from "../components/LatestListing";
import Plans from "../components/Plans";
import ProductsSseFeed from "../components/ProductsSseFeed.jsx";
import MarqueeCarousel from "../components/MarqueeCarousel.jsx";
import Carousel from "../components/Carousel.jsx";
import GuildExchangeSection from "../components/Home/GuildExchangeSection";
import DesktopPointsRewards from "../components/pointsRewards/DesktopPointsRewards.jsx";
import MobilePointsRewards from "../components/pointsRewards/MobilePointsRewards.jsx";
import { useCountdown } from "../hooks/useCountdown";
import { getStoredValue, setStoredValue } from "../utils/localStorage";
// import { mockPointsRewardProgram } from "../mock/mockPointsRewardProgram";
import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { computeMobileProgress } from "../utils/pointsProgressCalculator";
import { buildBaseProgressModel } from "../utils/buildBaseProgressModel";
import { computeDesktopProgress } from "../utils/computeDesktopProgress";

const cardsData = [
  {
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    name: "華麗金屬",
    from: "台南",
    description:
      "上次在Line交易群被騙，心碎三天… 你這邊交易有保障還能查賣家評價，終於敢放心買裝備了！",
    reward: "100",
  },
  {
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    name: "金掐楊",
    from: "台中",
    description: "平常代煉賺外快，靠你平臺接單賺爆～已經在這成交好幾單！",
    reward: "50",
  },
  {
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
    name: "富川",
    from: "香港",
    description:
      "入門新手！平台操作介面容易，一點心意，給平台維運人員一點支持~",
    reward: "80",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
    name: "走敲",
    from: "日本",
    description:
      "靠北這平台也太物操所值了吧~~~一個月訂閱方案居然只要1塊美金，平台方也太佛心了!!",
    reward: "350",
  },
];

const slides = [
  "https://banner.gnjoy.com.tw/Uploads/a9980f2aeb9e488c90e5863f5f3b32ad.jpg",
  "https://banner.gnjoy.com.tw/Uploads/42601ff3dc914ad5bfa4f5ff4347170f.jpg",
  "https://banner.gnjoy.com.tw/Uploads/c884dcbb168b46629ea917f40b44ac00.jpg",
  "https://banner.gnjoy.com.tw/Uploads/8cee6b67c04e4ac98e15a2190601c03c.jpg",
];

const Home = () => {
  // useMediaQuery 可以避免 Hydration mismatch。 指的是 伺服器端渲染 (SSR) 輸出的 HTML 和 客戶端 React 在 hydration 過程中建立的 Virtual DOM 不一致時，React 會發出警告或造成 UI 閃爍的問題。
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isAuthenticated } = useContext(AuthContext);

  const [isAdOpen, setIsAdOpen] = useState(
    getStoredValue("WELCOME_AD_IS_OPEN", true),
  );
  const handleCloseAd = () => setIsAdOpen(false);
  const { remindTime, isCountingDown, startCountdown } = useCountdown(
    3,
    handleCloseAd,
  );
  useEffect(() => setStoredValue("WELCOME_AD_IS_OPEN", isAdOpen), [isAdOpen]);

  const {
    data: program, // 這一步是對的，因為 desktop 和 mobile 都需要原始資料。
    isLoading,
    error,
  } = useQuery({
    queryKey: ["points-program"],
    queryFn: async () => {
      const response = await fetch(
        // summer-login-campaign-test
        // apiUrl("/events/summer-login-campaign-test/tasks"),
        apiUrl("/events/points-reward-demo/tasks"),
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        },
      );

      if (!response.ok) {
        throw new Error(`API 錯誤：${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (
        !data ||
        typeof data !== "object" ||
        !data.points ||
        !Array.isArray(data.tasks)
      ) {
        throw new Error("API 回傳格式不正確");
      }

      return data;
    },
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const baseProgress = program ? buildBaseProgressModel(program) : null;

  const desktopProgress = baseProgress
    ? computeDesktopProgress(baseProgress)
    : null;

  const mobileProgress = baseProgress
    ? computeMobileProgress(baseProgress)
    : null;
  return (
    <>
      {/* 外層 div 從空 class → 變成 relative 容器 */}
      <div className="relative w-full">
        {/* fixed inset-0（把背景圖層固定在 viewport） */}
        {/* 圖片小於容器時，可能會 repeat，所以要避免圖片重複出現，確保只出現一次，不會在 X/Y 方向重複貼滿*/}
        <div
          className="fixed inset-0 -z-10 pointer-events-none bg-no-repeat bg-left-top bg-cover"
          style={{
            backgroundImage:
              "url(https://static.gnjoy.com.tw/TRO/event/20260202_horseYear/img/acc_fixed_flower.png)",
          }}
        />
        <div className="relative z-10">
          {isAdOpen && (
            <div className="fixed inset-0 z-50 w-full h-full bg-yellow-200/30 flex items-center justify-center">
              <div className="relative">
                <button
                  onClick={startCountdown}
                  className="absolute top-1 right-2 z-110 text-red-500"
                >
                  <XIcon className="w-5 h-5" />
                </button>
                {isCountingDown ? (
                  <p className="mb-1">{remindTime}s 後關閉</p>
                ) : (
                  <p className="mb-1">按 X 即可關閉</p>
                )}
                <img
                  src="https://p2.bahamut.com.tw/B/2KU/17/9d5087cd7079a2b12b2e8d6bef1us6h5.JPG"
                  alt=""
                  className="w-100 h-auto"
                />
              </div>
            </div>
          )}
          <div className="relative">
            <div className="w-full">
              <Carousel slides={slides} />
            </div>
          </div>
          <GuildExchangeSection />
          {isLoading && <div>載入積分任務中...</div>}
          {error && <div>載入失敗，請稍後再試</div>}
          {desktopProgress && mobileProgress && (
            <section className="w-full">
              <div className="mx-auto w-[min(92vw,1400px)] px-4 sm:px-6">
                {!isMobile ? (
                  <DesktopPointsRewards
                    progress={desktopProgress}
                    tasks={program.tasks}
                    onTaskAction={(task) => {
                      console.log("click task", task);
                    }}
                  />
                ) : (
                  <MobilePointsRewards progress={mobileProgress} />
                )}
              </div>
            </section>
          )}

          <div className="flex-1.5 flex flex-col items-center">
            <Hero />
            <LatestListing />
            <div className="w-full">
              <Plans />
              <div className="text-center mb-14">
                <h2 className="text-gray-700 text-4xl font-semibold">
                  金主爸爸
                </h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  感謝金主爸爸的贊助，讓小弟得以營運此平台。
                </p>
              </div>
              <div className="block max-md:hidden">
                <MarqueeCarousel
                  type="donate"
                  bannerData={cardsData}
                  style={`flex`}
                  direction="horizontal"
                />
              </div>
              <div className="hidden max-md:block">
                <MarqueeCarousel
                  type="donate"
                  bannerData={cardsData}
                  style={`flex flex-col`}
                  direction="vertical"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
export const Route = createFileRoute("/")({
  component: Home,
});
