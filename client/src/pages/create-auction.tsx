
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Gavel,
  ShieldCheck,
  Sword,
} from "lucide-react";

import { getMyInventory } from "../api/inventory";
import type { InventoryItem } from "../types/inventory";

type AuctionFormData = {
  startingPrice: string;
  minIncrement: string;
  endTime: string;
};

type AuctionFormErrors = Partial<
  Record<keyof AuctionFormData, string>
>;

type AuctionStep = "form" | "confirm";

const initialFormData: AuctionFormData = {
  startingPrice: "",
  minIncrement: "",
  endTime: "",
};

const categoryLabels: Record<string, string> = {
  equipment: "裝備",
  consumable: "消耗品",
  material: "材料",
  other: "其他",
};

function CreateAuctionListingPage() {
  const { inventory_item_id } = Route.useSearch();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [formData, setFormData] =
    useState<AuctionFormData>(initialFormData);

  const [errors, setErrors] =
    useState<AuctionFormErrors>({});

  const [step, setStep] = useState<AuctionStep>("form");

  useEffect(() => {
    const controller = new AbortController();

    async function loadItem() {
      setLoading(true);
      setLoadError("");
      setItem(null);

      if (!inventory_item_id) {
        setLoadError("尚未選擇要刊登的物品，請先返回背包。");
        setLoading(false);
        return;
      }

      try {
        const inventory = await getMyInventory(controller.signal);
        const selected = inventory.find(
          (entry) => entry.id === inventory_item_id,
        );

        if (!selected) {
          throw new Error("找不到指定物品，或此物品不屬於目前帳號。");
        }

        if (!selected.is_tradeable || selected.status !== "AVAILABLE") {
          throw new Error("此物品目前不可進行競拍刊登。");
        }

        if (!controller.signal.aborted) {
          setItem(selected);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "無法載入物品資料",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadItem();

    return () => controller.abort();
  }, [inventory_item_id]);

  const updateField = (
    field: keyof AuctionFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const nextErrors: AuctionFormErrors = {};

    const startingPrice = Number(formData.startingPrice);
    const minIncrement = Number(formData.minIncrement);
    const endTime = new Date(formData.endTime).getTime();

    if (
      !formData.startingPrice ||
      !Number.isSafeInteger(startingPrice) ||
      startingPrice <= 0
    ) {
      nextErrors.startingPrice = "請輸入大於 0 的有效整數";
    }

    if (
      !formData.minIncrement ||
      !Number.isSafeInteger(minIncrement) ||
      minIncrement <= 0
    ) {
      nextErrors.minIncrement = "最低加價幅度必須是大於 0 的整數";
    }

    if (
      !formData.endTime ||
      !Number.isFinite(endTime) ||
      endTime <= Date.now()
    ) {
      nextErrors.endTime = "結標時間必須晚於目前時間";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const proceedToConfirmation = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!item || !validateForm()) return;

    setStep("confirm");
  };

  const fieldClass =
    "w-full rounded-lg border border-cyan-800 bg-[#081a2c] px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400";

  return (
    <div className="min-h-screen bg-[#030b16] px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/account"
          className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-100"
        >
          <ArrowLeft size={16} />
          返回玩家資產中心
        </Link>

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-amber-300">
            <Gavel size={20} />
            <span className="text-xs tracking-[0.3em]">
              NEXELYTH AUCTION
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-widest text-amber-100 md:text-4xl">
            競拍刊登
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            從玩家背包選擇物品，設定競拍條件並確認刊登資訊。
          </p>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "填寫資料", number: 1 },
            { label: "確認刊登", number: 2 },
            { label: "完成", number: 3 },
          ].map(({ label, number }) => {
            const active =
              step === "form" ? number === 1 : number === 2;

            const completed = step === "confirm" && number === 1;

            return (
              <div
                key={number}
                className={`rounded-lg border px-3 py-3 text-center text-sm ${
                  active
                    ? "border-amber-500 bg-amber-900/20 text-amber-200"
                    : completed
                      ? "border-cyan-700 bg-cyan-950/30 text-cyan-300"
                      : "border-slate-800 bg-[#091827] text-slate-500"
                }`}
              >
                <div className="mb-1 flex justify-center">
                  {completed ? (
                    <Check size={18} />
                  ) : (
                    <span>{number}</span>
                  )}
                </div>
                {label}
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-xl border border-cyan-900 bg-[#071726] p-10 text-center text-cyan-200">
            正在讀取玩家背包物品...
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-900/70 bg-[#1d111a] p-8">
            <p className="text-red-300">{loadError}</p>
            <Link
              to="/account"
              className="mt-5 inline-flex items-center gap-2 text-cyan-300"
            >
              <ArrowLeft size={16} />
              返回背包選擇物品
            </Link>
          </div>
        ) : item ? (
          <div className="space-y-6">
            <section className="rounded-xl border border-cyan-800/70 bg-[#071726] p-6">
              <h2 className="mb-5 text-lg font-semibold text-cyan-300">
                刊登物品
              </h2>

              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border border-amber-700/60 bg-[#102b43]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-28 w-28 object-contain"
                    />
                  ) : (
                    <Sword size={56} className="text-amber-300" />
                  )}
                </div>

                <div className="min-w-0 space-y-2">
                  <h3 className="text-xl font-bold text-amber-100">
                    {item.name}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {item.item_code} ·{" "}
                    {categoryLabels[item.category] ?? item.category}
                  </p>

                  <p className="text-sm text-emerald-300">
                    AVAILABLE · 可交易
                  </p>

                  <p className="text-sm leading-6 text-slate-300">
                    {item.description || "目前沒有物品描述。"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-lg border border-cyan-900 bg-[#0b2235] p-3 text-xs leading-6 text-slate-400">
                <ShieldCheck
                  size={17}
                  className="mt-1 shrink-0 text-cyan-300"
                />
                物品資料由玩家背包自動載入，無法自行修改名稱、
                圖片及分類。
              </div>
            </section>

            {step === "form" ? (
              <form
                onSubmit={proceedToConfirmation}
                className="space-y-5 rounded-xl border border-cyan-800/70 bg-[#071726] p-6"
              >
                <h2 className="text-lg font-semibold text-cyan-300">
                  設定競拍條件
                </h2>

                <div>
                  <label
                    htmlFor="startingPrice"
                    className="mb-2 block text-sm text-slate-200"
                  >
                    起標價 *
                  </label>
                  <input
                    id="startingPrice"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.startingPrice}
                    onChange={(e) =>
                      updateField("startingPrice", e.target.value)
                    }
                    placeholder="請輸入起標價"
                    className={fieldClass}
                  />
                  {errors.startingPrice && (
                    <p className="mt-2 text-sm text-red-300">
                      {errors.startingPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="minIncrement"
                    className="mb-2 block text-sm text-slate-200"
                  >
                    最低加價幅度 *
                  </label>
                  <input
                    id="minIncrement"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.minIncrement}
                    onChange={(e) =>
                      updateField("minIncrement", e.target.value)
                    }
                    placeholder="請輸入最低加價幅度"
                    className={fieldClass}
                  />
                  {errors.minIncrement && (
                    <p className="mt-2 text-sm text-red-300">
                      {errors.minIncrement}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="mb-2 flex items-center gap-2 text-sm text-slate-200"
                  >
                    <Clock3 size={16} />
                    結標時間 *
                  </label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) =>
                      updateField("endTime", e.target.value)
                    }
                    className={fieldClass}
                  />
                  {errors.endTime && (
                    <p className="mt-2 text-sm text-red-300">
                      {errors.endTime}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <Link
                    to="/account"
                    className="flex-1 rounded-lg border border-cyan-900 px-4 py-3 text-center text-sm text-slate-300 hover:bg-cyan-950"
                  >
                    取消
                  </Link>

                  <button
                    type="submit"
                    className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 font-semibold text-[#091521] hover:bg-amber-500"
                  >
                    下一步：確認刊登
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <section className="rounded-xl border border-amber-700/60 bg-[#071726] p-6">
                <h2 className="mb-5 text-lg font-semibold text-amber-200">
                  確認競拍資訊
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">物品名稱</span>
                    <span>{item.name}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">起標價</span>
                    <span>{Number(formData.startingPrice).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">最低加價幅度</span>
                    <span>{Number(formData.minIncrement).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">結標時間</span>
                    <span>
                      {new Date(formData.endTime).toLocaleString("zh-TW")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-amber-900/60 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">
                  目前為競拍刊登 UI 測試階段。
                  後端所有權驗證與物品鎖定功能尚未完成，
                  暫時不開放正式送出。
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="flex-1 rounded-lg border border-cyan-900 px-4 py-3 text-slate-300 hover:bg-cyan-950"
                  >
                    返回修改
                  </button>

                  <button
                    type="button"
                    disabled
                    className="flex-[2] cursor-not-allowed rounded-lg bg-amber-700/40 px-4 py-3 font-semibold text-amber-100/50"
                  >
                    正式確認刊登（尚未開放）
                  </button>
                </div>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/create-auction")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { inventory_item_id: string } => ({
    inventory_item_id:
      typeof search.inventory_item_id === "string"
        ? search.inventory_item_id
        : "",
  }),
  component: CreateAuctionListingPage,
});
