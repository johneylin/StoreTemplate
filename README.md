# J&P

A starter ecommerce website built with the following stack:

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Prisma 7 with PostgreSQL
- NextAuth credentials login
- Vercel Blob for admin media uploads

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

- Admin: values come from `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`
- Shopper: values come from `SHOPPER_NAME`, `SHOPPER_EMAIL`, and `SHOPPER_PASSWORD` (defaults are included in `.env.example`)

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

## Admin media uploads

- The admin product form can now upload product images and videos directly to Vercel Blob.
- Uploads require `BLOB_READ_WRITE_TOKEN`.
- You can still paste a hosted media URL manually if you prefer.

## Vercel deployment

1. Create a PostgreSQL database and set `DATABASE_URL` in Vercel.
2. Create a Vercel Blob store in the same Vercel project.
3. Add these Vercel environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `BLOB_READ_WRITE_TOKEN`
   - `ETRANSFER_EMAIL`
   - `PICKUP_STREET`
   - `PICKUP_CITY`
   - `PICKUP_STATE`
   - `PICKUP_POSTCODE`
   - `ADMIN_NAME`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `SHOPPER_NAME`
   - `SHOPPER_EMAIL`
   - `SHOPPER_PASSWORD`
4. In Vercel build settings, use:

   ```bash
   npm run vercel-build
   ```

5. Redeploy.

This project now includes Prisma migrations in [prisma/migrations](./prisma/migrations). Vercel should run `prisma migrate deploy` during build to create or update tables in production.

## Admin credentials in production

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used by the seed script.
- They are also accepted directly during sign-in, so updating those env vars in Vercel can bootstrap or refresh the admin account on the next successful login.
- If you also want demo products and pickup windows in production, run the seed once against the production database.

## Safe production seed

The seed script is idempotent:
- users are upserted by email
- products are upserted by slug
- pickup windows are created if missing and updated if already present
- existing orders are not deleted

That makes it safe to run once against production to bootstrap admin credentials and sample catalog data.

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
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read-write token used for admin uploads
- `ETRANSFER_EMAIL`: Destination email shown for e-transfer payments
- `PICKUP_STREET`: Pickup street address
- `PICKUP_CITY`: Pickup city
- `PICKUP_STATE`: Pickup state or province
- `PICKUP_POSTCODE`: Pickup postal code or ZIP code
- `ADMIN_NAME`: Seeded and auto-synced admin display name
- `ADMIN_EMAIL`: Seeded and auto-synced admin login email
- `ADMIN_PASSWORD`: Seeded and auto-synced admin login password
- `SHOPPER_NAME`: Seeded shopper display name
- `SHOPPER_EMAIL`: Seeded shopper login email
- `SHOPPER_PASSWORD`: Seeded shopper login password

## Notes

- Checkout is pickup only.
- Customers can place guest orders, but they must choose a pickup time and provide either a phone number or an email address.
- Admins manage available pickup date and time windows from the admin order workspace.
- The order confirmation page shows the payment method, pickup address, pickup time, contact detail, and a short `YYMMxxxxx` order code.
- Admin product management now supports direct Vercel Blob uploads for images and videos.

## Verification run completed here

The app was verified in this environment with:

```bash
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run prisma:generate"
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run lint"
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run build"
```
