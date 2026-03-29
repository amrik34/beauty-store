import Link from "next/link";
import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import CartClient from "./cart-client";

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? await getCart(cartId) : null;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Your Cart</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Review your items and proceed to checkout.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Continue shopping
          </Link>
        </div>

        <CartClient initialCart={cart} />
      </main>
    </div>
  );
}
