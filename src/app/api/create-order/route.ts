import type { NextRequest } from "next/server";
import Razorpay from "razorpay";

export async function POST(req:NextRequest) {
  try {
    const { amount, currency } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return Response.json(order);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}