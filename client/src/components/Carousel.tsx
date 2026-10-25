
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface CarouselProps {
  slides: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export default function Carousel({
  slides,
  autoSlide = true,
  autoSlideInterval = 5000,
}: CarouselProps) {
  const [curr, setCurr] = useState(0);

  const slideCount = slides.length;
  const activeIndex = slideCount > 0 ? curr % slideCount : 0;

  const prev = useCallback(() => {
    if (slideCount < 2) return;

    setCurr((current) => (current - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const next = useCallback(() => {
    if (slideCount < 2) return;

    setCurr((current) => (current + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (!autoSlide || slideCount < 2 || autoSlideInterval <= 0) return;

    const timer = window.setInterval(next, autoSlideInterval);

    return () => window.clearInterval(timer);
  }, [autoSlide, autoSlideInterval, next, slideCount]);

  if (slideCount === 0) return null;

  return (
    <section
      aria-label="NEXELYTH 活動輪播"
      className="relative h-[220px] w-full overflow-hidden bg-[#06111e] md:h-[300px] lg:h-[380px]"
    >
      {/* 輪播圖片 */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
        }}
      >
        {slides.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="h-full w-full shrink-0"
          >
            <img
              src={src}
              alt={`NEXELYTH 活動 Banner ${index + 1}`}
              className="h-full w-full object-cover object-center"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* 左右切換 */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="上一張 Banner"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-cyan-400/40 bg-[#071525]/75 p-2 text-cyan-100 transition hover:bg-[#17466a]"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="下一張 Banner"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-cyan-400/40 bg-[#071525]/75 p-2 text-cyan-100 transition hover:bg-[#17466a]"
          >
            <ChevronRight size={24} />
          </button>

          {/* 頁碼圓點 */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {slides.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setCurr(index)}
                aria-label={`切換至第 ${index + 1} 張 Banner`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  activeIndex === index
                    ? "scale-125 bg-cyan-300"
                    : "bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
