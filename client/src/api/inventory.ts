
import { apiUrl } from "../config/api";
import type {
  InventoryItem,
  InventoryResponse,
} from "../types/inventory";

export async function getMyInventory(
  signal?: AbortSignal,
): Promise<InventoryItem[]> {
  const response = await fetch(apiUrl("/api/inventory/me"), {
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    throw new Error(`背包資料取得失敗（HTTP ${response.status}）`);
  }

  const result: InventoryResponse = await response.json();

  return result.data ?? [];
}
