"use client";

import { useEffect } from "react";
import type { ShopifyProduct } from "@/lib/shopify";

type ProductsClientProps = {
  products: ShopifyProduct[];
};

export default function ProductsClient({ products }: ProductsClientProps) {
  useEffect(() => {
    console.log(products, "products");
  }, [products]);

  return null;
}
