import { useContext, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  ChevronDown,
  UserRound,
  LayoutDashboard,
  Backpack,
  Store,
  ReceiptText,
  Gem,
  Loader2,
} from "lucide-react";
import { AuthContext } from "../context/auth-context-def";

const links = [
  { label: "首頁 Desktop", to: "/" },
  { label: "交易市集", to: "/marketplace" },
  { label: "競拍區", to: "/aution" },
  { label: "文章列表", to: "/articlesList" },
  { label: "會員專區", to: "/memberRegisterPage" },
  { label: "刊登拍賣品", to: "/create-auction" },
] as const;

function Navabr() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const { isAuthenticated, userInfo, authLoading } =
    useContext(AuthContext);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { displayName, avatarLetter } = useMemo(() => {
    if (!userInfo?.email) {
      return { displayName: "會員", avatarLetter: "?" };
    }

    const name = userInfo.email.split("@")[0];

    return {
      displayName: name,
      avatarLetter: name.charAt(0).toUpperCase(),
    };
  }, [userInfo]);

  function closeMenus() {
    setMenuOpen(false);
    setAvatarOpen(false);
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] border-b border-cyan-500/25 bg-[#041120]/95 text-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1920px] items-center justify-between gap-5 px-5 lg:px-10">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenus}
          className="group flex shrink-0 items-center gap-3"
        >
          <div className="flex size-10 items-center justify-center rounded-lg border border-cyan-500/35 bg-cyan-950/50 shadow-[0_0_18px_rgba(0,190,255,.16)]">
            <Gem
              className="text-cyan-300 transition group-hover:text-white"
              size={24}
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-base font-semibold tracking-[0.2em] text-cyan-50">
              NEXELYTH
            </div>
            <div className="text-[9px] tracking-[0.35em] text-cyan-400/80">
              MARKETPLACE
            </div>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden min-w-0 items-center gap-4 xl:flex 2xl:gap-7">
          {links.map((item) => {
            const active =
              pathname.toLowerCase() === item.to.toLowerCase();

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenus}
                className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm transition-colors ${
                  active
                    ? "border-cyan-400 text-cyan-200"
                    : "border-transparent text-slate-300 hover:border-cyan-600 hover:text-cyan-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Account */}
        <div className="flex items-center gap-3">
          {authLoading ? (
            <div className="flex items-center gap-2 text-xs text-cyan-200">
              <Loader2 size={16} className="animate-spin" />
              正在驗證...
            </div>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                aria-expanded={avatarOpen}
                aria-haspopup="menu"
                onClick={() => setAvatarOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full border border-cyan-500/45 bg-[#09263B]/90 px-2.5 py-1.5 text-left shadow-[0_0_15px_rgba(0,190,255,.10)] transition hover:border-cyan-300"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 text-sm font-bold text-white">
                  {avatarLetter}
                </span>
                <span className="hidden max-w-[135px] truncate text-sm text-cyan-100 sm:block">
                  {displayName}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-cyan-300 transition-transform ${
                    avatarOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {avatarOpen && (
                <>
                  <button
                    type="button"
                    aria-label="關閉帳號選單"
                    onClick={() => setAvatarOpen(false)}
                    className="fixed inset-0 z-[101] cursor-default"
                  />

                  <div
                    role="menu"
                    className="absolute right-0 top-full z-[102] mt-3 w-72 overflow-hidden rounded-xl border border-cyan-600/50 bg-[#07192B] p-2 shadow-[0_18px_45px_rgba(0,0,0,.65)]"
                  >
                    <div className="border-b border-cyan-900 p-3">
                      <div className="flex items-center gap-2 text-cyan-200">
                        <UserRound size={17} />
                        <span className="text-sm font-semibold">
                          玩家帳號
                        </span>
                      </div>
                      <p className="mt-2 break-all text-xs text-slate-400">
                        {userInfo?.email}
                      </p>
                    </div>

                    <Link
                      role="menuitem"
                      to="/account"
                      onClick={closeMenus}
                      className="mt-2 flex items-center gap-3 rounded-lg bg-cyan-900/40 px-3 py-3 text-sm text-cyan-200 transition hover:bg-cyan-800/50"
                    >
                      <LayoutDashboard size={18} />
                      玩家資產中心
                    </Link>

                    <div className="space-y-1 py-2">
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500">
                        <Backpack size={17} />
                        Marketplace 背包（即將開放）
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500">
                        <Store size={17} />
                        我的上架商品（即將開放）
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500">
                        <ReceiptText size={17} />
                        交易紀錄（即將開放）
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/memberRegisterPage"
              className="flex items-center gap-2 rounded-full border border-cyan-700 bg-cyan-950/40 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-900/60"
            >
              <UserRound size={16} />
              會員登入
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "關閉導覽選單" : "開啟導覽選單"}
            aria-expanded={menuOpen}
            className="rounded-lg border border-cyan-800 p-2 text-cyan-200 xl:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet navigation */}
      {menuOpen && (
        <div className="border-t border-cyan-900 bg-[#061525] px-5 py-4 xl:hidden">
          <div className="grid gap-2 sm:grid-cols-2">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenus}
                className="rounded-md px-3 py-3 text-sm text-slate-200 transition hover:bg-cyan-900/40 hover:text-cyan-200"
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                to="/account"
                onClick={closeMenus}
                className="rounded-md border border-cyan-700/50 bg-cyan-900/30 px-3 py-3 text-sm text-cyan-200"
              >
                玩家資產中心
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navabr;
