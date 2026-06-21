import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { logoutAction } from "../actions";

// Dashboard chrome. Guards every page under it (defense in depth — proxy also
// gates, but this redirects cleanly if proxy is ever bypassed).
export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getSession())) redirect("/admin/login");

  return (
    <>
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-5 px-[clamp(20px,4vw,40px)] py-[14px]">
          <div className="flex items-center gap-[28px]">
            <Link
              href="/admin"
              className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink"
            >
              Flourish Admin
            </Link>
            <nav className="flex items-center gap-[20px] font-display text-[13px] tracking-[0.02em]">
              <Link href="/admin/product" className="text-ink-soft transition-colors hover:text-gold">
                Product
              </Link>
              <Link href="/admin/orders" className="text-ink-soft transition-colors hover:text-gold">
                Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-[16px]">
            <Link
              href="/"
              target="_blank"
              className="font-display text-[13px] text-muted transition-colors hover:text-ink"
            >
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="cursor-pointer rounded-full border border-ink/20 bg-transparent px-[16px] py-[7px] font-display text-[13px] text-ink transition-colors hover:bg-ink/[0.05]"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-[clamp(20px,4vw,40px)] py-[clamp(32px,5vw,56px)]">
        {children}
      </main>
    </>
  );
}
