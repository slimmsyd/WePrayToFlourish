# We Pray To Flourish

Single-product book store (**52 Laws of You** by Yaddin) on Next.js 16, with
Stripe payments, a Neon Postgres database, and an admin CRM for editing the
product, pricing, and copy.

## 📖 Full guide: [`docs/HOW-TO-USE.md`](docs/HOW-TO-USE.md)

Read that for setup (env + database), the admin CRM, taking test payments, the
project map, and reusing this as a template.

## Quick start

```bash
npm install
cp .env.example .env.local           # then fill in the values (see the guide)
node --env-file=.env.local scripts/db-init.mjs   # create + seed tables
npm run dev                          # http://localhost:3000
```

Admin CRM: **http://localhost:3000/admin/login** (password = your `ADMIN_PASSWORD`).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
