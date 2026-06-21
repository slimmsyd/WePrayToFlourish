import { getOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="flex flex-col gap-[clamp(20px,4vw,32px)]">
      <div className="flex flex-col gap-[6px]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
          Orders
        </span>
        <h1 className="m-0 font-display text-[clamp(26px,3.4vw,40px)] font-normal leading-[1.05] tracking-[-0.02em]">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </h1>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-[10px] bg-panel p-[28px] text-[15px] text-ink-soft">
          No orders yet. Completed Stripe checkouts will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-ink/10">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-panel text-left font-display text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="px-[14px] py-[12px] font-medium">Date</th>
                <th className="px-[14px] py-[12px] font-medium">Customer</th>
                <th className="px-[14px] py-[12px] font-medium">Ship to</th>
                <th className="px-[14px] py-[12px] font-medium text-center">Qty</th>
                <th className="px-[14px] py-[12px] font-medium text-right">Total</th>
                <th className="px-[14px] py-[12px] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink/10 align-top">
                  <td className="whitespace-nowrap px-[14px] py-[12px] text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString()}
                    <span className="block text-[11px] text-muted">
                      {new Date(o.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-[14px] py-[12px]">
                    <span className="block font-medium text-ink">{o.name || "—"}</span>
                    <span className="block text-[12px] text-muted">{o.email}</span>
                  </td>
                  <td className="px-[14px] py-[12px] text-ink-soft">
                    {o.address_line ? (
                      <>
                        {o.address_line}
                        <span className="block text-[12px] text-muted">
                          {[o.city, o.postal_code, o.country].filter(Boolean).join(", ")}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-[14px] py-[12px] text-center text-ink-soft">{o.qty}</td>
                  <td className="whitespace-nowrap px-[14px] py-[12px] text-right font-medium text-ink">
                    {money(o.total_cents, o.currency)}
                  </td>
                  <td className="px-[14px] py-[12px]">
                    <span className="inline-flex items-center rounded-full bg-ink/[0.06] px-[10px] py-[3px] text-[11px] capitalize text-ink-soft">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
