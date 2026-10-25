
import { Sword, X, ShoppingBag, Gavel } from "lucide-react";

export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  is_tradeable: boolean;
  status: string;
}

interface InventoryItemDialogProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSell: (item: InventoryItem) => void;
  onAuction: (item: InventoryItem) => void;
}

export default function InventoryItemDialog({
  item,
  onClose,
  onSell,
  onAuction,
}: InventoryItemDialogProps) {
  if (!item) return null;

  const canTrade =
    item.is_tradeable && item.status === "AVAILABLE";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-item-title"
        className="w-full max-w-lg rounded-xl border border-amber-600/60 bg-[#091b2d] p-6 text-slate-100 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="inventory-item-title"
            className="text-xl font-bold text-amber-200"
          >
            物品詳情
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉物品詳情"
            className="text-slate-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-amber-700/50 bg-[#102b45]">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-20 w-20 object-contain"
              />
            ) : (
              <Sword size={44} className="text-amber-300" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-amber-100">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {item.item_code} · {item.category}
            </p>
            <p className="mt-2 text-sm text-cyan-300">
              {canTrade ? "可交易" : "目前不可交易"}
            </p>
          </div>
        </div>

        <p className="mt-5 rounded-lg bg-[#10273c] p-4 text-sm leading-6 text-slate-300">
          {item.description || "這件物品目前沒有詳細描述。"}
        </p>

        <p className="mt-3 text-xs text-slate-400">
          物品狀態：{item.status}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!canTrade}
            onClick={() => onSell(item)}
            className="flex items-center justify-center gap-2 rounded-lg border border-cyan-600 bg-[#123853] px-3 py-3 text-sm text-cyan-100 hover:bg-[#195173] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={18} />
            一般販售
          </button>

          <button
            type="button"
            disabled={!canTrade}
            onClick={() => onAuction(item)}
            className="flex items-center justify-center gap-2 rounded-lg border border-amber-600 bg-[#47341e] px-3 py-3 text-sm text-amber-100 hover:bg-[#614624] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Gavel size={18} />
            競拍刊登
          </button>
        </div>
      </section>
    </div>
  );
}
