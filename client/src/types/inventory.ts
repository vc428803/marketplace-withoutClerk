
export type InventoryStatus = "AVAILABLE" | "LISTED";

export type InventoryCategory =
  | "equipment"
  | "consumable"
  | "material"
  | "other";

// 玩家背包中的單一物品
export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description: string;
  image_url: string;
  category: InventoryCategory;
  is_tradeable: boolean;
  status: InventoryStatus;
}

// GET /api/inventory/me 的回傳格式
export interface InventoryResponse {
  data: InventoryItem[];
}
