"use client";

import { useMemo, useState } from "react";
import type { ShopifyCart, ShopifyCartLine } from "@/lib/shopify";

type CartClientProps = {
  initialCart: ShopifyCart | null;
};

type CartState = {
  cart: ShopifyCart | null;
  status: "idle" | "loading" | "error";
  message: string | null;
};

export default function CartClient({ initialCart }: CartClientProps) {
  const [state, setState] = useState<CartState>({
    cart: initialCart,
    status: "idle",
    message: null,
  });

  const lines = useMemo(
    () => state.cart?.lines.edges.map((edge) => edge.node) ?? [],
    [state.cart],
  );

  async function updateCart(body: object) {
    setState((prev) => ({ ...prev, status: "loading", message: null }));

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error ?? "Cart update failed.");
      }

      const data = await response.json();
      setState({ cart: data.cart, status: "idle", message: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        message: error instanceof Error ? error.message : "Cart update failed.",
      }));
    }
  }

  function lineTotal(line: ShopifyCartLine) {
    const amount = Number(line.merchandise.price.amount);
    return (amount * line.quantity).toFixed(2);
  }

  if (!state.cart || lines.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <ul className="space-y-4">
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex flex-col gap-4 border-b border-zinc-200 pb-4 last:border-b-0 last:pb-0 dark:border-zinc-800 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                {line.merchandise.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={line.merchandise.image.url}
                    alt={
                      line.merchandise.image.altText ??
                      line.merchandise.product.title
                    }
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                )}
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {line.merchandise.product.title}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {line.merchandise.title}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-between gap-4 md:justify-end">
                <select
                  value={line.quantity}
                  onChange={(event) =>
                    updateCart({
                      action: "update",
                      lineId: line.id,
                      quantity: Number(event.target.value),
                    })
                  }
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  disabled={state.status === "loading"}
                >
                  {[1, 2, 3, 4, 5].map((qty) => (
                    <option key={qty} value={qty}>
                      Qty {qty}
                    </option>
                  ))}
                </select>

                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {lineTotal(line)} {line.merchandise.price.currencyCode}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateCart({ action: "remove", lineId: line.id })
                  }
                  className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-400"
                  disabled={state.status === "loading"}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Subtotal
          </div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {state.cart.cost.subtotalAmount.amount}{" "}
            {state.cart.cost.subtotalAmount.currencyCode}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {state.message ? (
            <span className="text-sm text-rose-600 dark:text-rose-400">
              {state.message}
            </span>
          ) : null}
          <a
            href={state.cart.checkoutUrl}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Checkout
          </a>
        </div>
      </div>
    </div>
  );
}
