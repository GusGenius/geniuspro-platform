import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover",
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { plan, type, amount, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let priceId: string | null = null;
    let successUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://platform.geniuspro.io"}/billing?success=true`;
    let cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://platform.geniuspro.io"}/billing?canceled=true`;

    // Determine price ID based on plan or credit type
    if (type === "credits") {
      // Credit pack - $100 for 1000 credits
      priceId = process.env.STRIPE_CREDITS_PRICE_ID || "";
      if (!priceId) {
        // Fallback: create a one-time payment
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "GeniusPro Credits",
                  description: "$100 credit pack",
                },
                unit_amount: amount * 100, // Convert to cents
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          client_reference_id: userId,
          metadata: {
            userId,
            type: "credits",
            amount: amount.toString(),
          },
        });
        return NextResponse.json({ url: session.url });
      }
    } else if (plan === "pro") {
      priceId = process.env.STRIPE_PRO_PRICE_ID || "";
    } else if (plan === "enterprise") {
      // Enterprise requires custom handling
      return NextResponse.json(
        { error: "Please contact sales for Enterprise plans" },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured. Please contact support." },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: plan ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        plan: plan || "credits",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
