import { useEffect, useState } from "react";
import { apiUrl } from "../../config/api";
import { Sword } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getMyInventory } from "../../api/inventory";
import InventoryItemDialog from "../../components/account/InventoryItemDialog";
import type { InventoryItem } from "../../types/inventory";
import {
  Backpack,
  Coins,
  Store,
  ReceiptText,
  Package,
  Compass,
  Shield,
  ArrowRight,
} from "lucide-react";

const menuItems = [
  { label: "資產總覽", Icon: Compass, active: true },
  { label: "Marketplace 背包", Icon: Backpack },
  { label: "我的上架商品", Icon: Store },
  { label: "交易紀錄", Icon: ReceiptText },
  { label: "遊戲幣異動", Icon: Coins },
];

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-cyan-800/70 bg-[#071726]/90 p-5 shadow-[0_0_20px_rgba(0,190,255,0.08)]">
      <h2 className="mb-4 text-lg font-semibold text-cyan-300">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AccountPage() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] =
    useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadInventory() {
      try {
        const response = await fetch(apiUrl("/api/inventory/me"), {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("無法取得背包物品");
        }

        const result = await response.json();
        setInventory(result.data ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setInventoryError("背包資料載入失敗");
        }
      } finally {
        if (!controller.signal.aborted) {
          setInventoryLoading(false);
        }
      }
    }

    loadInventory();

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-[#030b16] text-slate-100">
      <div className="flex min-h-screen">
        {/* 左側奇幻世界導航 */}
        <aside
          className="hidden w-60 shrink-0 border-r border-cyan-900/80 bg-cover bg-center lg:block"
          style={{
            backgroundImage:
              "linear-gradient(180deg,rgba(2,10,24,.85),rgba(2,10,24,.92)),url('/nexelyth/account-sidebar.webp')",
          }}
        >
          <div className="sticky top-24 p-4">
            <div className="mb-8 border-b border-cyan-800/70 pb-5">
              <div className="text-xl font-semibold tracking-[0.18em] text-cyan-300">
                NEXELYTH
              </div>
              <div className="mt-1 text-xs tracking-[0.3em] text-slate-400">
                ASSET MANAGEMENT
              </div>
            </div>

            <nav className="space-y-2" aria-label="玩家資產導覽">
              {menuItems.map(({ label, Icon, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm ${active
                    ? "border-cyan-400/70 bg-cyan-900/50 text-cyan-200 shadow-[0_0_16px_rgba(0,200,255,.17)]"
                    : "border-transparent text-slate-300"
                    }`}
                >
                  <Icon size={19} />
                  {label}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* 主內容 */}
        <main className="min-w-0 flex-1">
          <header
            className="relative min-h-56 border-b border-cyan-900 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(90deg,rgba(2,10,24,.95) 0%,rgba(2,10,24,.55) 55%,rgba(2,10,24,.12) 100%),url('/nexelyth/account-world.webp')",
            }}
          >
            <div className="relative px-6 py-12 md:px-10">
              <div className="flex items-center gap-3 text-cyan-300">
                <Shield size={28} />
                <span className="text-sm tracking-[0.3em]">
                  PLAYER ASSETS
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-widest text-white md:text-4xl">
                玩家資產中心
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                管理 Marketplace 遊戲幣、物品與交易紀錄。
                未來可將平台資產同步至 NEXELYTH VR 世界。
              </p>
            </div>
          </header>

          <div className="space-y-5 p-5 md:p-8">
            <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
              <Panel title="Marketplace 背包">
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">

                  {Array.from(
                    { length: Math.max(10, inventory.length) },
                    (_, index) => {
                      const item = inventory[index];

                      return (
                        <button
                          key={item?.id ?? `empty-${index}`}
                          type="button"
                          disabled={!item}
                          onClick={() => {
                            if (item) setSelectedItem(item);
                          }}
                          title={item?.name ?? "空背包格"}
                          className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg transition ${item
                            ? "cursor-pointer bg-[#091d30] hover:brightness-125"
                            : "cursor-default border border-sky-900 bg-[#091d30]/80"
                            }`}
                        >
                          {item ? (
                            <>
                              {/* 共用金藍物品外框 */}
                              <img
                                src="/nexelyth/ui/nexelyth-item-frame-gold-blue-cropped.png"
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 z-20 h-full w-full object-fill"
                              />

                              {/* 物品圖片或預設圖示 */}
<div className="absolute inset-[18%] z-10 flex items-center justify-center">
  {item.image_url || item.item_code === "SWORD_001" ? (
    <img
      src={
        item.image_url ||
        "/nexelyth/items/weapons/nexelyth-azure-knight-sword.png"
      }
      alt={item.name}
      className="h-full w-full object-contain"
    />
  ) : (
    <Sword
      size={30}
      className="text-amber-300"
    />
  )}
</div>

                              {/* 物品名稱 */}
                              <div className="absolute bottom-[8%] left-[12%] right-[12%] z-30 text-center">
                                <span className="block truncate text-[10px] font-semibold text-amber-100 drop-shadow-[0_2px_4px_#000] sm:text-xs">
                                  {item.name}
                                </span>
                              </div>
                            </>
                          ) : (
                            <Package
                              size={25}
                              className="text-sky-900"
                            />
                          )}
                        </button>
                      );
                    },
                  )}

                </div>

                <p className="mt-4 text-sm text-slate-400">
                  {inventoryLoading
                    ? "正在載入 Marketplace 背包..."
                    : inventoryError
                      ? inventoryError
                      : `目前持有 ${inventory.length} 件物品`}
                </p>
              </Panel>

              <div className="space-y-5">
                <Panel title="我的上架商品">
                  <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center">
                    <Store className="mx-auto text-slate-500" />
                    <p className="mt-3 text-sm text-slate-400">
                      尚未連接商品刊登資料
                    </p>
                  </div>
                </Panel>

                <Panel title="最近交易紀錄">
                  <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center">
                    <ReceiptText className="mx-auto text-slate-500" />
                    <p className="mt-3 text-sm text-slate-400">
                      尚未連接交易紀錄
                    </p>
                  </div>
                </Panel>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ArrowRight size={14} />
              Marketplace Storage 將作為未來 VR 物品領取的交接空間
            </div>
          </div>
        </main>
      </div>
      <InventoryItemDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSell={(item) => {
          console.log("一般販售：", item.id);
          setSelectedItem(null);
        }}
        onAuction={(item) => {
          setSelectedItem(null);

          void navigate({
            to: "/create-auction",
            search: {
              inventory_item_id: item.id,
            },
          });
        }}
      />
    </div>
  );
}



export const Route = createFileRoute("/account/")({
  component: AccountPage,
});
