import "server-only";
import {
  newsletterAdminEmail,
  newsletterWelcomeEmail,
  orderAdminEmail,
  orderConfirmationEmail,
} from "./email-templates";
import { getFeaturedProduct, getSiteContent } from "./content";
import { getOrderItems, type OrderRow } from "./orders";
import { resolveSiteUrl } from "./site-url";
import site from "@/site.config";
import {
  getAdminEmail,
  getFromAddress,
  getResend,
  isEmailConfigured,
} from "./resend";

type SendResult = { ok: true } | { ok: false; error: string };

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  tags?: { name: string; value: string }[];
}): Promise<SendResult> {
  const { data, error } = await getResend().emails.send(
    {
      from: getFromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      tags: opts.tags,
    },
    { idempotencyKey: opts.idempotencyKey },
  );

  if (error) {
    console.error("[email]", error.message);
    return { ok: false, error: error.message };
  }

  console.log("[email] sent", opts.idempotencyKey, data?.id);
  return { ok: true };
}

/** Customer receipt + admin alert for a paid order. */
export async function sendOrderEmails(order: OrderRow): Promise<SendResult> {
  if (!isEmailConfigured()) {
    console.warn("[email] skipped order emails — Resend env not configured");
    return { ok: false, error: "Email not configured" };
  }

  if (!order.email) {
    return { ok: false, error: "Order missing customer email" };
  }

  const siteContent = await getSiteContent();
  const emailCopy = siteContent.copy.checkout.emails;
  const siteUrl = resolveSiteUrl(siteContent.brand.domain);
  const orderedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(order.created_at));

  const dbItems = await getOrderItems(order.id);
  const lineItems =
    dbItems.length > 0
      ? dbItems.map((item) => ({
          title: item.product_title,
          format: item.product_format,
          author: item.product_author,
          qty: item.qty,
          lineSubtotalCents: item.line_subtotal_cents,
        }))
      : [
          {
            title: "Order",
            format: "",
            author: "",
            qty: order.qty,
            lineSubtotalCents: order.subtotal_cents,
          },
        ];

  const customerTpl = orderConfirmationEmail({
    siteName: siteContent.brand.siteName,
    siteUrl,
    customerName: order.name || "friend",
    customerEmail: order.email,
    lineItems,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    taxCents: order.tax_cents,
    totalCents: order.total_cents,
    currency: order.currency,
    orderId: order.id,
    orderedAt,
    addressLine: order.address_line,
    city: order.city,
    postalCode: order.postal_code,
    country: order.country,
    ...emailCopy.customer,
  });

  const customerResult = await sendEmail({
    to: order.email,
    ...customerTpl,
    idempotencyKey: `order-confirmation/${order.stripe_payment_intent_id}`,
    tags: [
      { name: "type", value: "order_confirmation" },
      { name: "order_id", value: String(order.id) },
    ],
  });

  if (!customerResult.ok) return customerResult;

  const adminTpl = orderAdminEmail({
    siteName: siteContent.brand.siteName,
    adminOrdersUrl: `${siteUrl}/admin/orders`,
    customerName: order.name,
    customerEmail: order.email,
    lineItems,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    taxCents: order.tax_cents,
    totalCents: order.total_cents,
    currency: order.currency,
    orderId: order.id,
    orderedAt,
    addressLine: order.address_line,
    city: order.city,
    postalCode: order.postal_code,
    country: order.country,
    paymentIntentId: order.stripe_payment_intent_id,
    ...emailCopy.admin,
  });

  return sendEmail({
    to: getAdminEmail(),
    ...adminTpl,
    idempotencyKey: `order-admin/${order.stripe_payment_intent_id}`,
    tags: [
      { name: "type", value: "order_admin" },
      { name: "order_id", value: String(order.id) },
    ],
  });
}

/** Welcome email to subscriber + admin alert. */
export async function sendNewsletterEmails(email: string): Promise<SendResult> {
  if (!isEmailConfigured()) {
    console.warn("[email] skipped newsletter emails — Resend env not configured");
    return { ok: false, error: "Email not configured" };
  }

  const siteContent = await getSiteContent();
  const featured = await getFeaturedProduct();
  const emailCopy = siteContent.copy.freeChapter.emails;
  const siteUrl = resolveSiteUrl(siteContent.brand.domain);

  const welcomeTpl = newsletterWelcomeEmail({
    siteName: siteContent.brand.siteName,
    productTitle: featured?.title ?? siteContent.brand.siteName,
    author: featured?.author ?? siteContent.brand.siteName,
    siteUrl,
    ...emailCopy.welcome,
  });

  const welcomeResult = await sendEmail({
    to: email,
    ...welcomeTpl,
    idempotencyKey: `newsletter-welcome/${email.toLowerCase()}`,
    tags: [{ name: "type", value: "newsletter_welcome" }],
  });

  if (!welcomeResult.ok) return welcomeResult;

  const adminTpl = newsletterAdminEmail({
    email,
    productTitle: featured?.title ?? siteContent.brand.siteName,
    siteName: siteContent.brand.siteName,
    signedUpAt: new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date()),
    ...emailCopy.admin,
  });

  return sendEmail({
    to: getAdminEmail(),
    ...adminTpl,
    idempotencyKey: `newsletter-admin/${email.toLowerCase()}`,
    tags: [{ name: "type", value: "newsletter_admin" }],
  });
}