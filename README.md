# Northstar Commerce

A starter ecommerce website built with the following stack:

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Prisma 7 with PostgreSQL
- NextAuth credentials login

## Included pages

- Home page
- Product listing page with search and category filter
- Product detail page
- Cart page
- Checkout page
- Login / register page
- Order history page
- Admin dashboard for product CRUD
- Admin order workspace with pickup slot management

## Payments

- E-transfer
- Cash

## Seeded accounts

- Admin: `admin@example.com` / `Admin123!`
- Shopper: `shopper@example.com` / `Shopper123!`

## Local setup

1. Copy environment variables if you want a separate local file:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL with Docker:

   ```bash
   docker compose up -d db
   ```

3. Install dependencies if you are running on the host machine:

   ```bash
   npm install
   ```

4. Generate the Prisma client, apply the schema, and seed sample data:

   ```bash
   npm run prisma:generate
   npm run db:migrate -- --name init
   npm run db:seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Vercel deployment

1. Create a PostgreSQL database and set `DATABASE_URL` in Vercel.
2. Add these Vercel environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `ETRANSFER_EMAIL`
   - `PICKUP_STREET`
   - `PICKUP_CITY`
   - `PICKUP_STATE`
   - `PICKUP_POSTCODE`
3. In Vercel build settings, use:

   ```bash
   npm run vercel-build
   ```

4. Redeploy.

This project now includes Prisma migrations in [prisma/migrations](./prisma/migrations). Vercel should run `prisma migrate deploy` during build to create/update tables in production.

## Docker-only workflow used in this repository

If Node is not installed on the host, you can use the same containerized workflow I used here:

```bash
docker compose up -d db
docker run --rm -v "${PWD}:/app" -w /app node:22 bash -lc "npm install"
docker run --rm -v "${PWD}:/app" -w /app node:22 bash -lc "npm run prisma:generate && npx prisma migrate dev --name init && npm run db:seed"
docker run --rm -p 3000:3000 -v "${PWD}:/app" -w /app node:22 bash -lc "npm run dev"
```

On Windows PowerShell, replace `${PWD}` with the full repository path if needed.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Base URL for NextAuth callbacks
- `NEXTAUTH_SECRET`: Secret used by NextAuth
- `ETRANSFER_EMAIL`: Destination email shown for e-transfer payments
- `PICKUP_STREET`: Pickup street address
- `PICKUP_CITY`: Pickup city
- `PICKUP_STATE`: Pickup state or province
- `PICKUP_POSTCODE`: Pickup postal code or ZIP code

## Notes

- Checkout is pickup only.
- Customers can place guest orders, but they must choose a pickup time and provide either a phone number or an email address.
- Admins manage available pickup date/time windows from the admin order workspace.
- The order confirmation page shows the payment method, pickup address, pickup time, contact detail, and a short `YYMMxxxxx` order code.
- Admin product management uses image/video URLs to keep the starter simple and reviewable.

## Verification run completed here

The app was verified in this environment with:

```bash
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run prisma:generate"
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run lint"
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run build"
```
