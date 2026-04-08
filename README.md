# Northstar Commerce

A starter ecommerce website built with the following stack:

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Prisma 7 with PostgreSQL
- Stripe Checkout
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
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Docker-only workflow used in this repository

If Node is not installed on the host, you can use the same containerized workflow I used here:

```bash
docker compose up -d db
docker run --rm -v "${PWD}:/app" -w /app node:22 bash -lc "npm install"
docker run --rm -v "${PWD}:/app" -w /app node:22 bash -lc "npm run prisma:generate && npm run db:push && npm run db:seed"
docker run --rm -p 3000:3000 -v "${PWD}:/app" -w /app node:22 bash -lc "npm run dev"
```

On Windows PowerShell, replace `${PWD}` with the full repository path if needed.

## Environment variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Base URL for NextAuth callbacks
- `NEXTAUTH_SECRET`: Secret used by NextAuth
- `STRIPE_SECRET_KEY`: Stripe secret key for hosted checkout

## Notes

- Checkout uses Stripe Checkout and creates a local order before redirecting.
- Orders are marked paid on the success page when Stripe reports a paid session.
- Admin product management uses image/video URLs to keep the starter simple and reviewable.
- ESLint passes with a few `img` optimization warnings because the admin accepts arbitrary remote asset URLs.

## Verification run completed here

The app was verified in this environment with:

```bash
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run prisma:generate"
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run lint"
docker run --rm -v "C:\Users\Johney\source\repos\TempOrder:/app" -w /app node:22 bash -lc "npm run build"
```
