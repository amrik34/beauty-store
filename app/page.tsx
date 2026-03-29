import Link from "next/link";
import { getProducts } from "@/lib/shopify";
import ProductsClient from "./products-client";

export default async function Home() {
  const products = await getProducts(10);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full">
          <section className="-mx-6 w-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 text-white shadow-sm sm:-mx-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-300">
                Soft launch
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Glow-ready essentials for every routine
              </h2>
              <p className="mt-3 text-sm text-zinc-200">
                Discover clean, lightweight formulas curated for a fresh,
                hydrated look — day or night.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  View Cart
                </Link>
              </div>
            </div>
            <div className="h-40 w-full max-w-sm rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_rgba(0,0,0,0)_60%),linear-gradient(135deg,_rgba(244,114,182,0.9),_rgba(190,24,93,0.85))]" />
          </div>
        </section>
      </div>
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-between px-6 pb-12 sm:items-start sm:px-10">
        <div className="w-full">
          <div className="pt-10">
            <ProductsClient products={products} />
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              Products
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Skincare favorites curated for daily glow.
            </p>

            {products.length === 0 ? (
              <p className="mt-8 text-zinc-600 dark:text-zinc-400">
                No products found.
              </p>
            ) : (
              <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="group flex h-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-5 text-zinc-900 shadow-sm transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:border-pink-900/50"
                  >
                    {product.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText ?? product.title}
                        className="h-48 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-48 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/products/${product.handle}`}
                        className="text-lg font-semibold text-zinc-900 transition group-hover:text-pink-700 dark:text-zinc-100 dark:group-hover:text-pink-300"
                      >
                        {product.title}
                      </Link>
                      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {product.priceRange.minVariantPrice.amount}{" "}
                        {product.priceRange.minVariantPrice.currencyCode}
                      </div>
                    </div>
                    <Link
                      href={`/products/${product.handle}`}
                      className="inline-flex items-center justify-center rounded-full border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 transition hover:bg-pink-50 dark:border-pink-900/60 dark:text-pink-200 dark:hover:bg-pink-950/40"
                    >
                      View Details
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
