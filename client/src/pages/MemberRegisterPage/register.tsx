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
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (password.length < 12) {
      setError("密碼至少需要 12 個字元");
      return;
    }

    // 與目前 Golang bcrypt Handler 的 72-byte 限制一致
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

      setSuccess(`帳號 ${user.email} 註冊成功，現在可以登入。`);
      setPassword("");
    } catch {
      setError("無法連線至伺服器，請確認網路與後端服務");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">會員註冊</h2>

      <p className="text-gray-600">
        請填寫以下資料完成平台會員註冊。
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-email" className="block text-sm mb-1">
            信箱
          </label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="請輸入信箱"
          />
        </div>

        <div>
          <label htmlFor="register-password" className="block text-sm mb-1">
            密碼
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="請輸入密碼（至少 12 字元）"
          />
        </div>

        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}

        {success && (
          <div role="status" className="text-green-700 text-sm space-y-2">
            <p>{success}</p>
            <p>
              <Link to="/" className="underline font-medium">
                返回首頁登入
              </Link>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || Boolean(success)}
          className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "註冊中..." : "立即註冊"}
        </button>
      </form>
    </div>
  );
}

export const Route = createFileRoute("/MemberRegisterPage/register")({
  component: RegisterPage,
});
