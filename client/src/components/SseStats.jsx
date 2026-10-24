import { sseUrl } from "../config/api";
import { useEffect, useMemo, useState } from "react";

function parseKeyValueString(s) {
  // 你的 SSE data 長這樣：
  // "Total: 16777216000,Used: 8388608000,Perc: 50.00%"
  // "User: 12.34, Sys: 3.21, Idle: 84.45"
  const obj = {};
  if (!s) return obj;

  s.split(",").forEach((part) => {
    const [k, v] = part.split(":").map((x) => x?.trim());
    if (!k) return;
    obj[k] = v ?? "";
  });
  return obj;
}

function formatBytes(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return n ?? "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = num;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

export default function SseStats({ url = sseUrl("/events") }) {
  const [connected, setConnected] = useState(false);
  const [memRaw, setMemRaw] = useState("");
  const [cpuRaw, setCpuRaw] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    const es = new EventSource(url);

    es.onopen = () => {
      setConnected(true);
      setError("");
    };

    const onMem = (e) => setMemRaw(e.data);
    const onCpu = (e) => setCpuRaw(e.data);

    es.addEventListener("mem", onMem);
    es.addEventListener("cpu", onCpu);

    es.onerror = () => {
      // SSE 斷線時瀏覽器會自動重連；這裡只顯示狀態
      setConnected(false);
      setError("SSE disconnected / reconnecting…");
    };

    return () => {
      es.removeEventListener("mem", onMem);
      es.removeEventListener("cpu", onCpu);
      es.close();
    };
  }, [url]);

  const mem = useMemo(() => parseKeyValueString(memRaw), [memRaw]);
  const cpu = useMemo(() => parseKeyValueString(cpuRaw), [cpuRaw]);

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-4 rounded-2xl bg-white shadow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-gray-800">Server Live Monitor (SSE)</div>
          <div className="text-xs text-gray-500 break-all">{url}</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* MEM */}
        <div className="p-4 rounded-xl border">
          <div className="text-sm font-semibold text-gray-800 mb-2">Memory</div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="text-gray-500">Total: </span>
              <span className="font-medium">{formatBytes(mem.Total)}</span>
            </div>
            <div>
              <span className="text-gray-500">Used: </span>
              <span className="font-medium">{formatBytes(mem.Used)}</span>
            </div>
            <div>
              <span className="text-gray-500">Used %: </span>
              <span className="font-medium">{mem.Perc}</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-400 break-words">
            raw: {memRaw || "(waiting...)"}
          </div>
        </div>
      </div>
    </div>
  );
}
