"use server";

import prisma from "@src/lib/prisma";
import { safeObject } from "@src/util/format.util";
import { unstable_cache } from "next/cache";

const cache = (key: string, fn: () => Promise<any>) => {
  return unstable_cache(fn, [key], { revalidate: 604800 })();
};

export async function getProductsCount(storeSlug?: string): Promise<number> {
  return cache(`products-count-${storeSlug || "all"}`, async () => {
    const count = await prisma.product.count({
      ...(storeSlug && {
        where: { store: { slug: storeSlug } },
      }),
    });

    return count;
  });
}

export async function getProducts(cursorSlug?: string, storeSlug?: string) {
  return cache(
    `products-${cursorSlug || "start"}-${storeSlug || "all"}`,
    async () => {
      const products = await prisma.product.findMany({
        ...(storeSlug && {
          where: { store: { slug: storeSlug } },
        }),
        take: 30,
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          thumbnail: true,
          discount: { select: { percentage: true } },
          store: { select: { slug: true, name: true, city: true } },
          statistic: { select: { rating: true, sold: true } },
        },
        orderBy: { statistic: { sold: "desc" } },
        ...(cursorSlug && {
          skip: 1,
          cursor: { slug: cursorSlug },
        }),
      });

      return safeObject(products);
    },
  );
}

export async function getProductBySlug(storeSlug: string, productSlug: string) {
  return cache(`product-${storeSlug}-${productSlug}`, async () => {
    const product = await prisma.product.findFirst({
      where: { slug: productSlug, store: { slug: storeSlug } },
      include: {
        category: true,
        store: true,
        discount: true,
        statistic: true,
        images: true,
      },
    });

    return safeObject(product);
  });
}

export async function getStoreBySlug(storeSlug: string) {
  return cache(`store-${storeSlug}`, async () => {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      include: {
        _count: { select: { products: true } },
        products: {
          take: 30,
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            thumbnail: true,
            discount: { select: { percentage: true } },
            store: { select: { slug: true, name: true, city: true } },
            statistic: { select: { rating: true, sold: true } },
          },
        },
      },
    });

    return safeObject(store);
  });
}
