import { apiUrl, sseUrl } from "../config/api";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth-context-def";  // 新增這行，注意路徑
import { useProductNotices } from "../hooks/useProductNotices";
import { ProductNoticesPanel } from "../components/Home/ProductNoticesPanel";

export default function MemberLoginSection() {
  const { refreshAuth } = useContext(AuthContext); // 取得 refresh 方法
  const SSE_URL = sseUrl("/products/stream");
  const { notices, connected, error } = useProductNotices(SSE_URL);

  // 表單狀態
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        credentials: "include", // 送 request 時帶上現有 cookie，允許瀏覽器接收後端回傳的 cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("登入成功", data);
        // 登入成功後，呼叫父層級的 refreshAuth
        const isAuthUpdated = await refreshAuth();
        if (isAuthUpdated) {
          // 可以清空表單或顯示成功訊息
          setEmail("");
          setPassword("");
        }
      }else {
        setLoginError(data.message || "登入失敗");
      }
    } catch (err) {
      console.log("登入失敗:", err);
      setLoginError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full mt-5 mb-5">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex items-stretch gap-12">
          {/* 左：訊息公告 */}
          <ProductNoticesPanel
            connected={connected}
            notices={notices}
            error={error}
          />

          {/* 右：密碼登入（你原本的） */}
          <div className="flex-1 w-full max-w-[500px]">
            <div className="grid min-h-[280px] max-h-[280px] grid-rows-[auto_auto_1fr_auto]">
              <div className="flex items-center justify-between">
                <h2 className="text-red-500 text-xl font-semibold">登入會員</h2>
                {loginError && (
                  <p className="text-yellow-300 text-sm">{loginError}</p>
                )}
              </div>

              <div className="mt-4 border-b border-[#a17575]" />

              <div className="min-h-0 overflow-y-auto">
                <form
                  id="loginForm"
                  onSubmit={handleLogin}
                  className="grid gap-6 mt-6"
                >
                  <input
                    className="h-11 bg-transparent border border-white/30 px-3 text-sm"
                    placeholder="平台帳號"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className="h-11 bg-transparent border border-white/30 px-3 text-sm"
                    placeholder="平台密碼"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </form>

                <div className="mt-4">
                  <button
                    className="bg-red-600 text-white text-sm w-full h-11"
                    form="loginForm"
                    type="submit"
                  >
                    登入會員
                  </button>
                </div>
              </div>

              <div className="mt-8 border-b border-[#a17575]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
