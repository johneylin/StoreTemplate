import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

const payloadSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in before checking out." }, { status: 401 });
  }

  const payload = payloadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Your cart payload is invalid." }, { status: 400 });
  }

  const products = await db.product.findMany({
    where: {
      id: { in: payload.data.items.map((item) => item.productId) },
    },
  });

  const lineItems = payload.data.items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as { product: (typeof products)[number]; quantity: number }[];

  if (!lineItems.length) {
    return NextResponse.json({ error: "No valid products were found for checkout." }, { status: 400 });
  }

  const total = lineItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      total,
      items: {
        create: lineItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      },
    },
  });

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stripe is not configured." },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    customer_email: session.user.email ?? undefined,
    metadata: {
      orderId: order.id,
      userId: session.user.id,
    },
    line_items: lineItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.product.price,
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: [item.product.imageUrl],
        },
      },
    })),
  });

  await db.order.update({
    where: { id: order.id },
    data: {
      stripeCheckoutSessionId: checkoutSession.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
