import { useEffect, useRef, useState } from "react";
import { PAYPAL_CLIENT_ID, PAYPAL_PLAN_ID } from "../data/config";

// Renders the PayPal Subscriptions button. The subscription is created client
// side with the public client id + plan id and tagged with custom_id = the
// Supabase user id, so the webhook can grant premium to the right account.
// Premium is only unlocked once the webhook fires — never from onApprove here.

declare global {
  interface Window {
    paypal?: any;
  }
}

let sdkPromise: Promise<void> | null = null;
function loadSdk(): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID
    )}&vault=true&intent=subscription`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load PayPal"));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

export function PayPalButton({
  userId,
  onApproved,
}: {
  userId: string;
  onApproved: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSdk()
      .then(() => {
        if (cancelled || !ref.current || !window.paypal) return;
        ref.current.innerHTML = "";
        window.paypal
          .Buttons({
            style: { shape: "pill", color: "blue", label: "subscribe" },
            createSubscription: (_data: unknown, actions: any) =>
              actions.subscription.create({
                plan_id: PAYPAL_PLAN_ID,
                custom_id: userId,
              }),
            onApprove: () => onApproved(),
            onError: () => setError("Payment could not be completed. Please try again."),
          })
          .render(ref.current);
      })
      .catch(() => setError("Couldn't load PayPal. Check your connection and retry."));
    return () => {
      cancelled = true;
    };
  }, [userId, onApproved]);

  return (
    <div>
      <div ref={ref} />
      {error && <div className="warn-banner danger-banner">{error}</div>}
    </div>
  );
}
