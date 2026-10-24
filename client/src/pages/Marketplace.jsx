import { wsUrl } from "../config/api";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { ArrowLeftIcon, FilterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import FilterSiderbar from "../components/FilterSiderbar";
import { createFileRoute } from "@tanstack/react-router";
import { getProducts } from "../api/products";
import { productKeys } from "../queries/productKeys";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../api/products";
import ChatRoom from "../components/chat/ChatRoom";
import { useAuth } from "../hooks/use-auth";

const MINUTES = 1000 * 60;

const Marketplace = () => {
  const { isAuthenticated, userInfo, authLoading } = useAuth();
  const navigator = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    inputValue: "",
    platform: null,
    maxPrice: 100000,
    minPrice: 0,
    // verified: false,
    // featured: false,
  });

  const handleSearch = useCallback((keyword) => {
    setFilters((prev) => ({ ...prev, inputValue: keyword }));
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: productKeys.list(filters.inputValue || "all"),
    queryFn: () =>
      filters.inputValue ? searchProducts(filters.inputValue) : getProducts(),
    enabled: !!filters.inputValue || true,
    staleTime: 3 * MINUTES,
    gcTime: 10 * MINUTES,
  });

  const products = useMemo(() => data ?? [], [data]);
  const sortedProducts = useMemo(() => {
    return products.length
      ? [...products].sort(
          (a, b) => Number(b?.verified || 0) - Number(a?.verified || 0),
        )
      : [];
  }, [products]);

   if (authLoading) return <div>驗證中...</div>;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-lg text-slate-500">正在載入商品...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600">
        載入失敗：{error.message || "請稍後再試"}
      </div>
    );
  }
  return (
    <div className="flex flex-col px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="flex items-center justify-between text-slate-500">
        <button
          onClick={() => {
            navigator("/");
            scrollTo(0, 0);
          }}
          className="flex items-center gap-2 py-4 z-150"
        >
          <ArrowLeftIcon className="size-4" />
          回上一頁
        </button>
        <button
          onClick={() => {
            setShowFilter(true);
            scrollTo(0, 0);
          }}
          className="flex sm:hidden items-center gap-2 py-4"
        >
          <FilterIcon className="size-4" />
          篩選器
        </button>
      </div>
      <div className="relative flex items-start justify-between gap-8 pb-8 ">
        {/* 3. 傳遞 onSearch 到 FilterSiderbar */}
        <FilterSiderbar
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          searchValue={filters.inputValue} // ← 新增這行
        />
        <div className="flex-1 grid xl:grid-cols-2 gap-4">
          {sortedProducts.length === 0 ? (
            <p className="col-span-full text-center py-12 text-slate-500">
              目前沒有符合條件的商品
            </p>
          ) : (
            sortedProducts.map((product, index) => (
              <ListingCard
                key={product.id || index} // ← 強烈建議用唯一 id
                listing={product}
              />
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-[1000]">
        {/* 這層只負責當 absolute 的基準 */}
        <div className="relative">
          {/* ✅ Chat panel：在按鈕上方 */}
          {open && (
            <div className="absolute bottom-[72px] right-0 w-[360px] h-[500px]">
              {authLoading ? (
                <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden flex items-center justify-center p-4">
                  <p className="text-sm text-gray-500">正在確認登入狀態...</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden flex items-center justify-center p-4">
                  <p className="text-sm text-gray-500">
                    請先登入後再使用聊天室
                  </p>
                </div>
              ) : (
                <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden">
                  <ChatRoom
                    user={String(userInfo?.id || "")}
                    name={userInfo?.email || "Guest"}
                    urlBase={wsUrl("/ws")}
                  />
                </div>
              )}
            </div>
          )}

          {/* ✅ Floating button：永遠在底部 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="
          h-[60px] w-[60px] rounded-full bg-white
          flex items-center justify-center shadow-md
        "
            aria-label="Open chat"
          >
            <svg
              fill="#000000"
              viewBox="0 0 256 256"
              id="Flat"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M128.00049,28A100.02594,100.02594,0,0,0,41.11475,177.53908l-9.0044,31.51661a11.99971,11.99971,0,0,0,14.835,14.834l31.5166-9.00391A100.00677,100.00677,0,1,0,128.00049,28Zm0,192a91.87082,91.87082,0,0,1-46.95264-12.86719,3.99494,3.99494,0,0,0-3.14355-.4082l-33.15723,9.47363a3.99979,3.99979,0,0,1-4.94434-4.94531l9.47266-33.15625a4.00111,4.00111,0,0,0-.4082-3.14355A92.01077,92.01077,0,1,1,128.00049,220Zm50.51123-73.457-20.45947-11.69141a12.01054,12.01054,0,0,0-12.12745.12891l-13.80664,8.28418a44.04183,44.04183,0,0,1-19.38232-19.38281l8.28369-13.80664a12.0108,12.0108,0,0,0,.12891-12.127l-11.69092-20.46A10.91584,10.91584,0,0,0,100,72a32.00811,32.00811,0,0,0-32,31.88086A84.001,84.001,0,0,0,151.999,188h.12012A32.00842,32.00842,0,0,0,184,156,10.913,10.913,0,0,0,178.51172,146.543ZM152.10791,180h-.1084A75.99972,75.99972,0,0,1,76,103.8926,23.997,23.997,0,0,1,100,80a2.89975,2.89975,0,0,1,2.51172,1.457L114.20264,101.918a4.00418,4.00418,0,0,1-.043,4.042l-9.38916,15.64844a3.9987,3.9987,0,0,0-.21826,3.69824,52.04112,52.04112,0,0,0,26.1416,26.1416,3.99707,3.99707,0,0,0,3.69873-.21875L150.04,141.84084a4.006,4.006,0,0,1,4.043-.04394l20.46045,11.69238A2.89712,2.89712,0,0,1,176,156,23.99725,23.99725,0,0,1,152.10791,180Z"></path>
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

export const Route = createFileRoute("/Marketplace")({
  path: "/marketplace",
  component: Marketplace,
});
