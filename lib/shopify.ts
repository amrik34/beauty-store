// lib/shopify.ts
import { GraphQLClient } from "graphql-request";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

if (!storeDomain || !storefrontToken) {
  throw new Error(
    "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN in environment.",
  );
}

export const shopifyClient = new GraphQLClient(
  `https://${storeDomain}/api/2023-10/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
  },
);

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
};

type ProductsResponse = {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
};

export async function getProducts(first = 5): Promise<ShopifyProduct[]> {
  const query = /* GraphQL */ `
    query Products($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyClient.request<ProductsResponse>(query, { first });
  return data.products.edges.map((edge) => edge.node);
}

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  image: {
    url: string;
    altText: string | null;
  } | null;
};

export type ShopifyProductDetail = {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyVariant;
    }>;
  };
};

type ProductByHandleResponse = {
  productByHandle: ShopifyProductDetail | null;
};

export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProductDetail | null> {
  const query = /* GraphQL */ `
    query ProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        featuredImage {
          url
          altText
        }
        images(first: 6) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyClient.request<ProductByHandleResponse>(query, {
    handle,
  });
  return data.productByHandle;
}

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
    };
    image: {
      url: string;
      altText: string | null;
    } | null;
    price: ShopifyMoney;
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
};

type CartResponse = {
  cart: ShopifyCart | null;
};

type CartCreateResponse = {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

type CartLinesAddResponse = {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

type CartLinesUpdateResponse = {
  cartLinesUpdate: {
    cart: ShopifyCart | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

type CartLinesRemoveResponse = {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const query = /* GraphQL */ `
    query Cart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyClient.request<CartResponse>(query, { cartId });
  return data.cart;
}

export async function createCart(
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<ShopifyCart> {
  const mutation = /* GraphQL */ `
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      handle
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyClient.request<CartCreateResponse>(mutation, {
    lines,
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(
      data.cartCreate.userErrors[0]?.message ?? "Failed to create cart.",
    );
  }

  if (!data.cartCreate.cart) {
    throw new Error(
      data.cartCreate.userErrors[0]?.message ?? "Failed to create cart.",
    );
  }

  return data.cartCreate.cart;
}

export async function addCartLine(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<ShopifyCart> {
  const mutation = /* GraphQL */ `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      handle
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyClient.request<CartLinesAddResponse>(mutation, {
    cartId,
    lines,
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(
      data.cartLinesAdd.userErrors[0]?.message ?? "Failed to add cart line.",
    );
  }

  if (!data.cartLinesAdd.cart) {
    throw new Error(
      data.cartLinesAdd.userErrors[0]?.message ??
        "Failed to add cart line.",
    );
  }

  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<ShopifyCart> {
  const mutation = /* GraphQL */ `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      handle
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyClient.request<CartLinesUpdateResponse>(mutation, {
    cartId,
    lines,
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(
      data.cartLinesUpdate.userErrors[0]?.message ??
        "Failed to update cart line.",
    );
  }

  if (!data.cartLinesUpdate.cart) {
    throw new Error(
      data.cartLinesUpdate.userErrors[0]?.message ??
        "Failed to update cart line.",
    );
  }

  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart> {
  const mutation = /* GraphQL */ `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      handle
                    }
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyClient.request<CartLinesRemoveResponse>(mutation, {
    cartId,
    lineIds,
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(
      data.cartLinesRemove.userErrors[0]?.message ??
        "Failed to remove cart line.",
    );
  }

  if (!data.cartLinesRemove.cart) {
    throw new Error(
      data.cartLinesRemove.userErrors[0]?.message ??
        "Failed to remove cart line.",
    );
  }

  return data.cartLinesRemove.cart;
}
