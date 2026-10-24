import { sseUrl } from "../config/api";
import { useEffect, useMemo, useState } from "react";

function formatTime(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n)) return "";
  const d = new Date(n);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function safeStr(v, fallback = "") {
  if (v === null || v === undefined) return fallback;
  const s = String(v);
  return s.trim() ? s : fallback;
}

export default function ProductsSseTicker({
  url = sseUrl("/products/stream"),
}) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  // ✅ 只保留最新一筆（覆蓋用）
  const [latest, setLatest] = useState(null);

  // meta（可選：顯示版本/進度）
  const [meta, setMeta] = useState({ version: 0, index: 0, total: 0, ts: 0 });

  useEffect(() => {
    setError("");
    setConnected(false);
    setLatest(null);
    setMeta({ version: 0, index: 0, total: 0, ts: 0 });

    const es = new EventSource(url);

    es.onopen = () => {
      setConnected(true);
      setError("");
    };

    const onProduct = (e) => {
      try {
        const payload = JSON.parse(e.data);
        const p = payload?.data ?? {};

        const username = safeStr(p.username, "某位使用者");
        const title = safeStr(p.title, "某個商品");

        // ✅ 你的文字格式：Username 剛才刊登了 Title 商品
        const text = `${username} 剛才刊登了「${title}」商品`;

        const item = {
          text,
          ts: payload?.ts ?? Date.now(),
          product: p,
          version: payload?.version ?? 0,
          index: payload?.index ?? 0,
          total: payload?.total ?? 0,
        };

        // ✅ 覆蓋上一筆
        setLatest(item);

        setMeta({
          version: item.version,
          index: item.index,
          total: item.total,
          ts: item.ts,
        });
      } catch (err) {
        console.error("Invalid SSE product payload:", err, e.data);
      }
    };

    es.addEventListener("product", onProduct);

    es.onerror = () => {
      setConnected(false);
      setError("SSE disconnected / reconnecting…");
    };

    return () => {
      es.removeEventListener("product", onProduct);
      es.close();
    };
  }, [url]);

  const subtitle = useMemo(() => {
    if (!meta.total) return "等待商品資料…";
    return `v${meta.version} · ${meta.index + 1}/${meta.total} · ${formatTime(meta.ts)}`;
  }, [meta]);

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-4 rounded-2xl bg-white shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-gray-800">Products Live Ticker (SSE)</div>
          <div className="text-xs text-gray-500 break-all">{url}</div>
          <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        </div>

        <div className="text-sm">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
              connected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-400"}`} />
            {connected ? "connected" : "disconnected"}
          </span>
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      {/* ✅ 只顯示最新一筆（覆蓋效果） */}
      <div className="mt-4 p-4 rounded-xl border bg-gray-50">
        <div className="text-sm font-semibold text-gray-800 mb-1">最新上架</div>

        {latest ? (
          <>
            <div className="text-base text-gray-900">{latest.text}</div>
            <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
              <span>時間：{formatTime(latest.ts)}</span>
              {latest.product?.price !== undefined && <span>價格：{latest.product.price}</span>}
              {latest.product?.game && <span>Game：{latest.product.game}</span>}
              {latest.product?.platform && <span>Platform：{latest.product.platform}</span>}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">(waiting...)</div>
        )}
      </div>
    </div>
  );
}
