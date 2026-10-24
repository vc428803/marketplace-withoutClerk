import { useContext, useState, type FormEvent } from "react";
import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { AuthContext } from "../../context/auth-context-def";
import { apiUrl } from "../../config/api";

function LoginPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!auth) {
    throw new Error("LoginPage must be inside AuthProvider");
  }

  const { isAuthenticated, authLoading, refreshAuth } = auth;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        setError(
          response.status === 401
            ? "帳號或密碼錯誤"
            : "登入失敗，請稍後再試"
        );
        return;
      }

      const authenticated = await refreshAuth();

      if (!authenticated) {
        setError("登入驗證未完成，請重新嘗試");
        return;
      }

      setPassword("");
      await navigate({ to: "/account", replace: true });
    } catch {
      setError("無法連接伺服器，請確認網路連線");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <p className="py-12 text-center text-slate-600">
        正在確認登入狀態...
      </p>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="text-center text-2xl font-semibold text-[#543C26]">
        歡迎回到 NEXELYTH
      </h2>

      <p className="mt-2 text-center text-sm text-[#80694F]">
        登入帳號，繼續你的冒險旅程
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-sm font-medium text-[#543C26]"
          >
            電子信箱
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="請輸入電子信箱"
            className="h-12 w-full rounded-md border border-[#B99C72] bg-[#FFF9ED]/85 px-4 text-[#3A2B1F] outline-none focus:border-[#3479AD] focus:ring-2 focus:ring-[#3479AD]/20"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-sm font-medium text-[#543C26]"
          >
            密碼
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="請輸入密碼"
            className="h-12 w-full rounded-md border border-[#B99C72] bg-[#FFF9ED]/85 px-4 text-[#3A2B1F] outline-none focus:border-[#3479AD] focus:ring-2 focus:ring-[#3479AD]/20"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
    group relative mx-auto flex
    h-[76px] w-full max-w-[340px]
    items-center justify-center
    border-0 bg-transparent
    transition-transform duration-200
    hover:scale-[1.025]
    active:scale-[0.98]
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-[#2d9bde]
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
        >
          <span
            aria-hidden="true"
            className="
      pointer-events-none absolute inset-0
      bg-[url('/nexelyth/auth/login-button.png')]
      bg-contain bg-center bg-no-repeat
      drop-shadow-[0_5px_10px_rgba(0,0,0,0.4)]
      transition-[filter] duration-200
      group-hover:brightness-125
    "
          />

          <span className="relative z-10 text-[15px] font-semibold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]">
            {loading ? "登入中..." : "登入 Marketplace"}
          </span>
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          to="/MemberRegisterPage/register"
          className="text-[#345F86] hover:underline"
        >
          還沒有帳號？立即註冊
        </Link>

        <Link
          to="/MemberRegisterPage/forgot-password"
          className="text-[#80694F] hover:underline"
        >
          忘記密碼
        </Link>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/MemberRegisterPage/login")({
  component: LoginPage,
});
