
import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { apiUrl } from "../../config/api";

interface RegisterResponse {
  id: string;
  email: string;
}

interface ErrorResponse {
  error?: string;
}

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || success) return;

    setError("");

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    if (password.length < 12) {
      setError("密碼至少需要 12 個字元");
      return;
    }

    const passwordBytes = new TextEncoder().encode(password).length;

    if (passwordBytes > 72) {
      setError("密碼不可超過 72 bytes");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as ErrorResponse;

        if (response.status === 409) {
          setError("此 Email 已被註冊");
        } else if (response.status === 400) {
          setError(data.error || "請確認信箱與密碼格式");
        } else {
          setError("註冊失敗，請稍後重試");
        }
        return;
      }

      const user = (await response.json()) as RegisterResponse;

      setSuccess(`帳號 ${user.email} 註冊成功`);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("無法連線至伺服器，請確認網路與後端服務");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-md border border-[#B99C72] bg-[#FFF9ED]/85 px-4 text-[#3A2B1F] outline-none focus:border-[#3479AD] focus:ring-2 focus:ring-[#3479AD]/20";

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md py-10 text-center">
        <h2 className="text-2xl font-semibold text-[#543C26]">
          註冊完成
        </h2>

        <p role="status" className="mt-5 text-sm text-[#5B6940]">
          {success}
        </p>

        <p className="mt-3 text-sm text-[#80694F]">
          現在可以使用新帳號登入 Marketplace。
        </p>

        <Link
          to="/MemberRegisterPage/login"
          className="mt-8 block text-center text-base font-semibold text-[#345F86] hover:underline"
        >
          前往會員登入
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="text-center text-2xl font-semibold text-[#543C26]">
        會員註冊
      </h2>

      <p className="mt-2 text-center text-sm text-[#80694F]">
        建立你的帳號，加入 NEXELYTH 的冒險旅程
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-sm font-medium text-[#543C26]"
          >
            電子信箱
          </label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            placeholder="請輸入電子信箱"
          />
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-medium text-[#543C26]"
          >
            密碼
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            placeholder="請輸入密碼（至少 12 字元）"
          />
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-2 block text-sm font-medium text-[#543C26]"
          >
            確認密碼
          </label>
          <input
            id="register-confirm-password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClass}
            placeholder="請再次輸入密碼"
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
          className="group relative mx-auto flex h-[76px] w-full max-w-[340px] items-center justify-center border-0 bg-transparent transition-transform duration-200 hover:scale-[1.025] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A97827] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[url('/nexelyth/auth/register-button.png')] bg-contain bg-center bg-no-repeat drop-shadow-[0_5px_10px_rgba(0,0,0,0.35)] transition-[filter] duration-200 group-hover:brightness-110"
          />

          <span className="relative z-10 text-base font-semibold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]">
            {loading ? "註冊中..." : "立即註冊"}
          </span>
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#A98A64]/50" />
        <span className="text-xs text-[#80694F]">已經有帳號？</span>
        <span className="h-px flex-1 bg-[#A98A64]/50" />
      </div>

      <Link
        to="/MemberRegisterPage/login"
        className="mt-4 block text-center text-base font-semibold text-[#463321] hover:text-[#126A9B]"
      >
        前往會員登入
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/MemberRegisterPage/register")({
  component: RegisterPage,
});
