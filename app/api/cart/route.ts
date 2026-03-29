import { cookies } from "next/headers";
import {
  addCartLine,
  createCart,
  getCart,
  removeCartLine,
  updateCartLine,
} from "@/lib/shopify";

const CART_COOKIE = "cartId";

type CartAction =
  | { action: "add"; variantId: string; quantity?: number }
  | { action: "update"; lineId: string; quantity: number }
  | { action: "remove"; lineId: string };

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    return Response.json({ cart: null });
  }

  const cart = await getCart(cartId);

  if (!cart) {
    cookieStore.delete(CART_COOKIE);
    return Response.json({ cart: null });
  }

  return Response.json({ cart });
}

export async function POST(request: Request) {
  let body: CartAction;

  try {
    body = (await request.json()) as CartAction;
  } catch {
    return jsonError("Invalid JSON body.");
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;

  try {
    if (body.action === "add") {
      const quantity = body.quantity ?? 1;

      const cart = cartId
        ? await addCartLine(cartId, [
            { merchandiseId: body.variantId, quantity },
          ])
        : await createCart([{ merchandiseId: body.variantId, quantity }]);

      cookieStore.set(CART_COOKIE, cart.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });

      return Response.json({ cart });
    }

    if (!cartId) {
      return jsonError("Cart not found.", 404);
    }

    if (body.action === "update") {
      const cart = await updateCartLine(cartId, [
        { id: body.lineId, quantity: body.quantity },
      ]);
      return Response.json({ cart });
    }

    if (body.action === "remove") {
      const cart = await removeCartLine(cartId, [body.lineId]);
      return Response.json({ cart });
    }

    return jsonError("Unsupported action.");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Cart update failed.",
      500,
    );
  }
}
