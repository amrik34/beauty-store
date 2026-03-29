"use client";

import { useMemo, useState } from "react";
import type { ShopifyVariant } from "@/lib/shopify";

type ProductPurchaseProps = {
  variants: ShopifyVariant[];
};

export default function ProductPurchase({ variants }: ProductPurchaseProps) {
  const [selectedId, setSelectedId] = useState(
    variants[0]?.id ?? "",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedId) ?? variants[0],
    [selectedId, variants],
  );

  async function handleAddToCart() {
    if (!selectedVariant) return;

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          variantId: selectedVariant.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error ?? "Failed to add to cart.");
      }

      setStatus("success");
      setMessage("Added to cart.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to add to cart.",
      );
    }
  }

  if (!selectedVariant) {
    return (
      <div className="mt-6 rounded-md border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        No variants available.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Variant
        </label>
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.title} • {variant.price.amount}{" "}
              {variant.price.currencyCode}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={status === "loading" || !selectedVariant.availableForSale}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {selectedVariant.availableForSale ? "Add to Cart" : "Sold out"}
      </button>

      {message ? (
        <p
          className={`text-sm ${
            status === "error"
              ? "text-rose-600 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
