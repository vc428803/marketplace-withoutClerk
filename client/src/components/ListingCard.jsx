import React from "react";
import {
  BadgeCheck,
  Flame,
  View,
  CircleDollarSign,
  MapPin,
  Gamepad2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ListingCard = ({ listing }) => {
  const navigator = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  // 方式二：中文自然風 → 2月12日 15:46
  function formatNaturalDate(isoString) {
    const date = new Date(isoString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${month}月${day}日 ${hours}:${minutes}`;
  }

  return (
    <div className="flex relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transaction">
      {listing.featured ? (
        <>
          <div className="flex flex-col items-center justify-center w-[50px] px-1 text-center">
            <Flame className="text-red-500 w-5" />
            <span className="text-sm text-yellow-500 bg-gradient-to-r from-red-500 to-purple-500 rounded">
              熱推
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-[50px] px-1 border-r-0 text-center" />
      )}
      {/* 推薦tag的右半邊 */}
      <div className="p-5 pt-8 w-[100%]">
        {/* header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-500" />
            <span className="text-xs text-gray-500">
              {listing.platform || "Game"}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row items-center justify-between">
              <div>商品: {listing.title}</div>
              <div className="flex items-center text-xs font-medium bg-pink-100 text-pink-600 px-3 py-1 rounded-2xl capitalize">
                <span>iP位置</span>
                {listing.country && (
                  <div className="flex items-center px-2 text-gray-500 text-sm">
                    <MapPin className="size-3 ml-1 text-gray-400 " />
                    <p className="text-xs">{listing.country}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">玩家: {listing.username}</p>
              <span className="capitalize">遊戲種類: {listing.game}</span>
            </div>
          </div>

          {listing.verified && (
            <BadgeCheck className="text-blue-500 ml-auto w-5" />
          )}
        </div>
        {/* stats */}
        <div className="flex items-center gap-10 max-w-lg">
          <div className="flex items-center text-sm text-gray-400">
            <View className="size-6 mr-1 text-gray-400" />
            <span className="text-lg font-medium text-slate-800 mr-1.5">
              {(listing.views ?? 0).toLocaleString()}
            </span>{" "}
            次
          </div>

          {listing.price && (
            <div className="flex items-center text-sm text-gray-400">
              <CircleDollarSign className="size-6 mr-1 text-amber-300" />
              <span className="text-lg font-medium text-slate-800 mr-1.5">
                {listing.price}
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4 mt-2 line-clamp-2">
          簡述: {listing.description}
        </p>
        <hr className="my-5 border-gray-200 w-full" />
        {/* footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm text-green-400 font-bold">創建時間</p>
            <span>{formatNaturalDate(listing.createdAt)}</span>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-blue-600 font-bold">更新時間</p>
            <span>{formatNaturalDate(listing.updatedAt)}</span>
          </div>
          <button
            className="px-7 py-3 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            onClick={() => {
              navigator(`/listing/${listing.id}`);
              scrollTo(0, 0);
            }}
          >
            詳情
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
