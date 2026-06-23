import "server-only";

const fmtMoney = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f6f2ea;font-family:Georgia,'Times New Roman',serif;color:#1a1714;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(26,23,20,0.08);border-radius:8px;">
          <tr>
            <td style="padding:28px 32px 8px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#9c7b4d;">
              We Pray To Flourish
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;font-size:16px;line-height:1.65;color:#4a443c;">
              ${body}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string, opts?: { mono?: boolean }) {
  const valueStyle = opts?.mono
    ? "padding:12px 0;font-size:13px;color:#1a1714;"
    : "padding:12px 0;color:#1a1714;";
  return `<tr><td style="padding:12px 0;color:#4a443c;vertical-align:top;">${escapeHtml(label)}</td><td align="right" style="${valueStyle}">${escapeHtml(value)}</td></tr>`;
}

function formatShippingBlock(opts: {
  name: string;
  addressLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
}) {
  const lines = [
    opts.name,
    opts.addressLine,
    [opts.city, opts.postalCode].filter(Boolean).join(", "),
    opts.country,
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "—";
}

function orderLineItemsHtml(opts: {
  qty: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
}) {
  const subtotal = fmtMoney(opts.subtotalCents, opts.currency);
  const shipping =
    opts.shippingCents === 0 ? "Free" : fmtMoney(opts.shippingCents, opts.currency);
  const tax = fmtMoney(opts.taxCents, opts.currency);
  const total = fmtMoney(opts.totalCents, opts.currency);
  const taxRow =
    opts.taxCents > 0 ? detailRow("Tax", tax) : "";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid rgba(26,23,20,0.1);">
      ${detailRow("Quantity", String(opts.qty))}
      ${detailRow("Subtotal", subtotal)}
      ${detailRow("Shipping", shipping)}
      ${taxRow}
      <tr><td style="padding:12px 0;font-weight:600;color:#1a1714;">Total</td><td align="right" style="padding:12px 0;font-weight:600;color:#1a1714;">${total}</td></tr>
    </table>
  `;
}

function orderLineItemsText(opts: {
  qty: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
}) {
  const lines = [
    `Quantity: ${opts.qty}`,
    `Subtotal: ${fmtMoney(opts.subtotalCents, opts.currency)}`,
    `Shipping: ${opts.shippingCents === 0 ? "Free" : fmtMoney(opts.shippingCents, opts.currency)}`,
  ];
  if (opts.taxCents > 0) lines.push(`Tax: ${fmtMoney(opts.taxCents, opts.currency)}`);
  lines.push(`Total: ${fmtMoney(opts.totalCents, opts.currency)}`);
  return lines.join("\n");
}

export function orderConfirmationEmail(opts: {
  siteName: string;
  siteUrl: string;
  subject: string;
  headline: string;
  body: string;
  signOff: string;
  footer: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  productAuthor: string;
  productFormat: string;
  qty: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  orderId: number;
  orderedAt: string;
  addressLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
}) {
  const shipping = formatShippingBlock({
    name: opts.customerName,
    addressLine: opts.addressLine,
    city: opts.city,
    postalCode: opts.postalCode,
    country: opts.country,
  });

  const body = `
    <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#9c7b4d;">Order confirmed</p>
    <p style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#1a1714;">${escapeHtml(opts.headline)}</p>
    <p style="margin:0 0 8px;font-size:15px;color:#4a443c;">Hi ${escapeHtml(opts.customerName)},</p>
    ${paragraphsHtml(opts.body)}
    <p style="margin:0 0 20px;padding:16px 18px;background:#f6f2ea;border-radius:8px;font-size:15px;line-height:1.55;">
      <strong style="color:#1a1714;">${escapeHtml(opts.productTitle)}</strong><br />
      <span style="color:#4a443c;">${escapeHtml(opts.productFormat)} · by ${escapeHtml(opts.productAuthor)}</span>
    </p>
    ${orderLineItemsHtml(opts)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid rgba(26,23,20,0.1);">
      ${detailRow("Order", `#${opts.orderId}`)}
      ${detailRow("Date", opts.orderedAt)}
      ${detailRow("Email", opts.customerEmail)}
      ${detailRow("Ship to", shipping)}
    </table>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4a443c;white-space:pre-line;">${escapeHtml(opts.signOff)}</p>
    <p style="margin:0 0 20px;">
      <a href="${escapeHtml(opts.siteUrl)}" style="color:#9c7b4d;text-decoration:none;font-size:15px;">Visit ${escapeHtml(opts.siteName)}</a>
    </p>
    <p style="margin:0;font-size:13px;line-height:1.55;color:#4a443c;">${escapeHtml(opts.footer)}</p>
  `;

  return {
    subject: `${opts.subject} — ${opts.productTitle}`,
    html: layout(opts.subject, body),
    text: [
      opts.headline,
      "",
      `Hi ${opts.customerName},`,
      "",
      opts.body,
      "",
      `${opts.productTitle} (${opts.productFormat}) by ${opts.productAuthor}`,
      "",
      orderLineItemsText(opts),
      "",
      `Order #${opts.orderId}`,
      `Date: ${opts.orderedAt}`,
      `Email: ${opts.customerEmail}`,
      `Ship to:\n${shipping}`,
      "",
      opts.signOff,
      "",
      opts.siteUrl,
      "",
      opts.footer,
    ].join("\n"),
  };
}

export function orderAdminEmail(opts: {
  siteName: string;
  adminOrdersUrl: string;
  subject: string;
  headline: string;
  body: string;
  customerName: string;
  customerEmail: string;
  productTitle: string;
  productAuthor: string;
  productFormat: string;
  qty: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  orderId: number;
  orderedAt: string;
  addressLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  paymentIntentId: string;
}) {
  const shipping = formatShippingBlock({
    name: opts.customerName,
    addressLine: opts.addressLine,
    city: opts.city,
    postalCode: opts.postalCode,
    country: opts.country,
  });

  const body = `
    <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#9c7b4d;">Admin alert</p>
    <p style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#1a1714;">${escapeHtml(opts.headline)}</p>
    <p style="margin:0 0 20px;">${escapeHtml(opts.body)}</p>
    <p style="margin:0 0 20px;padding:16px 18px;background:#f6f2ea;border-radius:8px;font-size:15px;line-height:1.55;">
      <strong style="color:#1a1714;">${escapeHtml(opts.productTitle)}</strong><br />
      <span style="color:#4a443c;">${escapeHtml(opts.productFormat)} · by ${escapeHtml(opts.productAuthor)} · × ${opts.qty}</span>
    </p>
    ${orderLineItemsHtml(opts)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid rgba(26,23,20,0.1);">
      ${detailRow("Customer", opts.customerName)}
      ${detailRow("Email", opts.customerEmail)}
      ${detailRow("Ship to", shipping)}
      ${detailRow("Order", `#${opts.orderId}`)}
      ${detailRow("Date", opts.orderedAt)}
      ${detailRow("Site", opts.siteName)}
      ${detailRow("Stripe PI", opts.paymentIntentId, { mono: true })}
    </table>
    <p style="margin:0;">
      <a href="${escapeHtml(opts.adminOrdersUrl)}" style="color:#9c7b4d;text-decoration:none;font-size:15px;">View in admin CRM →</a>
    </p>
  `;

  const total = fmtMoney(opts.totalCents, opts.currency);

  return {
    subject: `${opts.subject} — ${opts.productTitle} (${total})`,
    html: layout(opts.headline, body),
    text: [
      opts.headline,
      "",
      opts.body,
      "",
      `${opts.productTitle} (${opts.productFormat}) by ${opts.productAuthor} × ${opts.qty}`,
      "",
      orderLineItemsText(opts),
      "",
      `Customer: ${opts.customerName}`,
      `Email: ${opts.customerEmail}`,
      `Ship to:\n${shipping}`,
      `Order #${opts.orderId}`,
      `Date: ${opts.orderedAt}`,
      `Stripe PI: ${opts.paymentIntentId}`,
      "",
      opts.adminOrdersUrl,
    ].join("\n"),
  };
}

function paragraphsHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;">${escapeHtml(p).replaceAll("\n", "<br />")}</p>`,
    )
    .join("");
}

export function newsletterWelcomeEmail(opts: {
  siteName: string;
  productTitle: string;
  author: string;
  siteUrl: string;
  subject: string;
  headline: string;
  body: string;
  signOff: string;
  footer: string;
}) {
  const body = `
    <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#9c7b4d;">Free chapter</p>
    <p style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#1a1714;">${escapeHtml(opts.headline)}</p>
    ${paragraphsHtml(opts.body)}
    <p style="margin:0 0 20px;padding:16px 18px;background:#f6f2ea;border-radius:8px;font-size:15px;line-height:1.55;">
      <strong style="color:#1a1714;">${escapeHtml(opts.productTitle)}</strong><br />
      <span style="color:#4a443c;">by ${escapeHtml(opts.author)}</span>
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4a443c;white-space:pre-line;">${escapeHtml(opts.signOff)}</p>
    <p style="margin:0 0 20px;">
      <a href="${escapeHtml(opts.siteUrl)}" style="color:#9c7b4d;text-decoration:none;font-size:15px;">Visit ${escapeHtml(opts.siteName)}</a>
    </p>
    <p style="margin:0;font-size:13px;line-height:1.55;color:#4a443c;">${escapeHtml(opts.footer)}</p>
  `;

  return {
    subject: opts.subject,
    html: layout(opts.subject, body),
    text: [
      opts.headline,
      "",
      opts.body,
      "",
      `${opts.productTitle} by ${opts.author}`,
      "",
      opts.signOff,
      "",
      opts.siteUrl,
      "",
      opts.footer,
    ].join("\n"),
  };
}

export function newsletterAdminEmail(opts: {
  email: string;
  productTitle: string;
  siteName: string;
  subject: string;
  headline: string;
  body: string;
  signedUpAt: string;
}) {
  const body = `
    <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#9c7b4d;">Admin alert</p>
    <p style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#1a1714;">${escapeHtml(opts.headline)}</p>
    <p style="margin:0 0 20px;">${escapeHtml(opts.body)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid rgba(26,23,20,0.1);">
      <tr><td style="padding:12px 0;color:#4a443c;">Email</td><td align="right" style="padding:12px 0;font-weight:600;color:#1a1714;">${escapeHtml(opts.email)}</td></tr>
      <tr><td style="padding:12px 0;color:#4a443c;">List</td><td align="right" style="padding:12px 0;">Free chapter — ${escapeHtml(opts.productTitle)}</td></tr>
      <tr><td style="padding:12px 0;color:#4a443c;">Site</td><td align="right" style="padding:12px 0;">${escapeHtml(opts.siteName)}</td></tr>
      <tr><td style="padding:12px 0;color:#4a443c;">Signed up</td><td align="right" style="padding:12px 0;">${escapeHtml(opts.signedUpAt)}</td></tr>
    </table>
    <p style="margin:0;font-size:14px;color:#4a443c;">This subscriber is stored in <code style="font-size:13px;">newsletter_subscribers</code>.</p>
  `;

  return {
    subject: `${opts.subject} — ${opts.email}`,
    html: layout(opts.headline, body),
    text: [
      opts.headline,
      "",
      opts.body,
      "",
      `Email: ${opts.email}`,
      `List: Free chapter — ${opts.productTitle}`,
      `Site: ${opts.siteName}`,
      `Signed up: ${opts.signedUpAt}`,
    ].join("\n"),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}