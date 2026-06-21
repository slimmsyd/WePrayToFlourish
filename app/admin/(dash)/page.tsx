import Link from "next/link";
import { getContentUpdatedAt, getProductContent } from "@/lib/content";
import { getOrderCount } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [product, updatedAt, orderCount] = await Promise.all([
    getProductContent(),
    getContentUpdatedAt(),
    getOrderCount(),
  ]);

  const cardClass =
    "flex flex-col gap-[10px] rounded-[10px] bg-panel p-[clamp(22px,3vw,30px)] transition-colors hover:bg-[#e9e2d3]";

  return (
    <div className="flex flex-col gap-[clamp(24px,4vw,36px)]">
      <div className="flex flex-col gap-[6px]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
          Dashboard
        </span>
        <h1 className="m-0 font-display text-[clamp(26px,3.4vw,40px)] font-normal leading-[1.05] tracking-[-0.02em]">
          Manage your store
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <Link href="/admin/product" className={cardClass}>
          <span className="font-display text-[19px] tracking-[-0.01em]">Product &amp; pricing</span>
          <span className="text-[14px] text-ink-soft">
            {product.title} · ${(product.priceCents / 100).toFixed(2)}
          </span>
          <span className="mt-[4px] text-[12px] text-muted">
            {updatedAt ? `Last edited ${updatedAt.toLocaleString()}` : "Using defaults"}
          </span>
        </Link>

        <Link href="/admin/orders" className={cardClass}>
          <span className="font-display text-[19px] tracking-[-0.01em]">Orders</span>
          <span className="text-[14px] text-ink-soft">
            {orderCount} {orderCount === 1 ? "order" : "orders"} recorded
          </span>
          <span className="mt-[4px] text-[12px] text-muted">View customer orders →</span>
        </Link>
      </div>
    </div>
  );
}
