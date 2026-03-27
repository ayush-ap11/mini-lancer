"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import type { PortalInvoice } from "@/hooks/use-portal";
import { usePortalPay } from "@/hooks/use-portal";
import { formatCurrency } from "@/lib/format-currency";

type RazorpayPayButtonProps = {
  invoiceId: string;
  token: string;
  invoiceNumber: string;
  amount: number;
};

type RazorpayPaymentSuccessPayload = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type PaymentState = "idle" | "preparing" | "checkout-open" | "submitted";

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export default function RazorpayPayButton({
  invoiceId,
  token,
  invoiceNumber,
  amount,
}: RazorpayPayButtonProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");

  const queryClient = useQueryClient();
  const portalPay = usePortalPay(token);

  const confirmPayment = async (payload: RazorpayPaymentSuccessPayload) => {
    const response = await fetch(`/api/portal/${token}/pay/${invoiceId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }
  };

  const handleClick = async () => {
    if (paymentState === "submitted") {
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      toast.error("Payment is not configured. Please try again later.");
      return;
    }

    let mutationSucceeded = false;

    try {
      setPaymentState("preparing");
      const payData = await portalPay.mutateAsync(invoiceId);
      mutationSucceeded = true;
      let paymentSubmitted = false;

      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay failed to initialize");
      }

      setPaymentState("checkout-open");

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: payData.amount,
        currency: payData.currency,
        order_id: payData.orderId,
        name: "Mini-lancer",
        description: `Payment for ${invoiceNumber}`,
        handler: async (response: RazorpayPaymentSuccessPayload) => {
          if (
            !response.razorpay_payment_id ||
            !response.razorpay_order_id ||
            !response.razorpay_signature
          ) {
            throw new Error("Missing Razorpay confirmation fields");
          }

          paymentSubmitted = true;
          await confirmPayment(response);
          setPaymentState("submitted");

          queryClient.setQueryData<PortalInvoice[]>(
            ["portal-invoices", token],
            (current) => {
              if (!current) {
                return current;
              }

              return current.map((invoice) =>
                invoice.id === invoiceId
                  ? {
                      ...invoice,
                      status: "PAID",
                      razorpayOrderId:
                        response.razorpay_order_id ?? invoice.razorpayOrderId,
                    }
                  : invoice,
              );
            },
          );

          toast.success("Payment successful! 🎉 Invoice marked as paid.", {
            description: "Status has been updated successfully.",
          });

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["portal-invoices", token],
            }),
            queryClient.invalidateQueries({
              queryKey: ["invoices"],
            }),
          ]);
        },
        modal: {
          ondismiss: () => {
            if (!paymentSubmitted) {
              setPaymentState("idle");
            }
          },
        },
        theme: {
          color: "#f97316",
        },
      });

      razorpay.open();
    } catch {
      setPaymentState("idle");
      if (mutationSucceeded) {
        toast.error("Could not start payment. Please try again.");
      }
    }
  };

  if (paymentState === "submitted") {
    return (
      <Button
        disabled
        className="h-12 w-full bg-green-600 text-base font-semibold text-white hover:bg-green-600 md:w-auto"
      >
        Paid <Check className="size-4" />
      </Button>
    );
  }

  if (paymentState === "preparing") {
    return (
      <Button
        disabled
        className="h-12 w-full gap-2 text-base font-semibold md:w-auto"
      >
        <Loader2 className="size-4 animate-spin" />
        Preparing payment...
      </Button>
    );
  }

  if (paymentState === "checkout-open") {
    return (
      <Button
        disabled
        className="h-12 w-full gap-2 text-base font-semibold md:w-auto"
      >
        <Loader2 className="size-4 animate-spin" />
        Payment Processing...
      </Button>
    );
  }

  return (
    <Button
      onClick={() => void handleClick()}
      disabled={portalPay.isPending}
      className="h-12 w-full bg-orange-500 text-base font-semibold text-white hover:bg-orange-600 md:w-auto"
    >
      Pay Now — {formatCurrency(amount)}
    </Button>
  );
}
