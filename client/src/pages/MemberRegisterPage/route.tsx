
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
  type LinkProps,
} from "@tanstack/react-router";

import { LogIn, UserRoundPlus, KeyRound } from "lucide-react";

type MemberMenu = {
  label: string;
  to: LinkProps["to"];
  icon: typeof LogIn;
};

const AUTH_ASSETS = "/nexelyth/auth";

const MENUS = [
  {
    label: "會員登入",
    to: "/MemberRegisterPage/login",
    icon: LogIn,
  },
  {
    label: "會員註冊",
    to: "/MemberRegisterPage/register",
    icon: UserRoundPlus,
  },
  {
    label: "忘記平台密碼",
    to: "/MemberRegisterPage/forgot-password",
    icon: KeyRound,
  },
] satisfies MemberMenu[];

function MemberRegisterPageLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const currentTitle =
    MENUS.find((menu) => menu.to === pathname)?.label ?? "會員專區";

  return (
    <div
      className="
    relative
    min-h-[calc(100vh-80px)]
    mt-20
    bg-[#06101d]
    bg-cover bg-center bg-no-repeat
    text-[#e8dfcf]
  "
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(3,10,20,.76), rgba(3,10,20,.38)), url("${AUTH_ASSETS}/member-background.png")`,
      }}
    >
      <div className="mx-auto max-w-[1250px] px-4 py-8 md:px-8 md:py-12">
        <nav className="mb-7 flex items-center gap-2 text-sm text-[#b4c9d7]">
          <Link to="/" className="hover:text-[#8ddcff]">
            首頁
          </Link>
          <span>›</span>
          <span>會員專區</span>
          <span>›</span>
          <span className="text-[#e9bc75]">{currentTitle}</span>
        </nav>

        <div className="grid items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className="relative min-h-[220px] bg-contain bg-top bg-no-repeat px-7 pb-14 pt-12 md:min-h-[680px]"
            style={{
              backgroundImage: `url("${AUTH_ASSETS}/member-sidebar.png")`,
            }}
          >
            <h2 className="mb-7 text-center text-2xl font-semibold tracking-widest text-[#f1cf91]">
              會員專區
            </h2>

            <div className="space-y-2">
              {MENUS.map((menu) => {
                const Icon = menu.icon;
                const isActive = pathname === menu.to;

                return (
                  <Link
                    key={menu.to}
                    to={menu.to}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md border px-3 py-3 text-sm transition ${isActive
                      ? "border-[#79c9ff] bg-[#164d78]/80 text-[#bce9ff] shadow-[0_0_15px_rgba(39,152,239,.22)]"
                      : "border-transparent bg-[#08192b]/45 text-[#e8dfcf] hover:border-[#3e789e] hover:bg-[#123651]"
                      }`}
                  >
                    <Icon size={18} />
                    {menu.label}
                  </Link>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-5 text-center">
              <span className="text-xs tracking-[.35em] text-[#9acfea]">
                NEXELYTH MARKETPLACE
              </span>
              <h1 className="mt-2 text-2xl font-semibold tracking-wider text-[#f2d49d]">
                {currentTitle}
              </h1>
            </div>

            <section
              className="
    relative mx-auto
    w-full max-w-[520px]
    min-h-[650px]
    bg-[length:100%_100%] bg-center bg-no-repeat
    px-[12%] pt-[115px] pb-[90px]
    text-[#3c2b20]
  "
              style={{
                backgroundImage: `url("${AUTH_ASSETS}/parchment-panel.png")`,
              }}
            >
              <div className="relative z-10">
                <Outlet />
              </div>
            </section>

            <div
              className="mx-auto mt-3 h-12 w-full max-w-[360px] bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${AUTH_ASSETS}/rune-divider.png")`,
              }}
              aria-hidden="true"
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/MemberRegisterPage")({
  component: MemberRegisterPageLayout,
});
