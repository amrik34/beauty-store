import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import ProductPurchase from "./product-purchase";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const variants = product.variants.edges.map((edge) => edge.node);
  const images = product.images.edges.map((edge) => edge.node);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 lg:flex-row">
        <div className="flex-1 space-y-4">
          {product.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              className="aspect-square w-full rounded-2xl object-cover shadow"
            />
          ) : (
            <div className="aspect-square w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          )}
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.url}
                  src={image.url}
                  alt={image.altText ?? product.title}
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <Link
              href="/"
              className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              Back to products
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">{product.title}</h1>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              {product.description || "No description provided."}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <ProductPurchase variants={variants} />
            <Link
              href="/cart"
              className="mt-4 inline-flex text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              View cart
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
