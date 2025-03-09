"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

export default function RazorpayButton() {
  const [loading, setLoading] = useState(false);
  const { data: user } = api.project.getUserDetailsWithCredits.useQuery();
  const updateUserCredits = api.project.updateCredits.useMutation();
  const refetch = useRefetch();

  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);

  const creditsToBuyAmount = creditsToBuy[0] ?? 100;
  const price = (creditsToBuyAmount / 2).toFixed(2);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (credits: number) => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/create-order", {
        amount: Math.round(credits / 2),
        currency: "INR",
      });

      if (!window.Razorpay) {
        toast.error("Payment gateway failed to load.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: "Gitlic",
        description: `Total ${credits} credits`,
        handler: () => {
          updateUserCredits.mutate(
            {
              credits: creditsToBuyAmount,
            },
            {
              onSuccess: () => {
                toast.success("Payment Successful");
                void refetch();
              },
              onError: () => {
                toast.error("Payment Failed");
              },
            },
          );
        },
        prefill: {
          name: user?.firstName,
          email: user?.emailAddresses?.[0]?.emailAddress || "",
        },
        theme: {
          color: "#3399cc",
        },
      });

      razorpay.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>
      <p className="text-sm text-gray-500">
        You currently have {user?.credits ?? 0} credits.
      </p>
      <div className="h-2"></div>
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm">
            Each credit allows you to index 1 file in a repository.
          </p>
          <p className="text-sm">
            E.g., If your project has 100 files, you will need 100 credits to
            index it.
          </p>
        </div>
        <div className="h-4"></div>
        <Slider
          defaultValue={[100]}
          max={1000}
          min={10}
          step={10}
          onValueChange={(value) => setCreditsToBuy(value)}
          value={creditsToBuy}
        />
        <div className="h-4"></div>
        <Button
          disabled={loading}
          onClick={async () => {
            await handlePayment(creditsToBuyAmount);
          }}
        >
          Buy {creditsToBuyAmount} credits for ₹{price}
        </Button>
      </div>
    </div>
  );
}
