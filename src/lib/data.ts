"use server";

import type { Prisma } from "@prisma/client";
import prisma from "@src/lib/prisma";
import { safeObject } from "@src/util/format.util";
import { unstable_cache } from "next/cache";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { store: true; discount: true; statistic: true; category: true };
}>;

const cache = (key: string, fn: () => Promise<any>) => {
  return unstable_cache(fn, [key], { revalidate: 604800 })();
  // return fn();
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

export async function getProductsForRecommender(): Promise<ProductWithRelations[]> {
  return cache("products-all-for-recommender", async (): Promise<ProductWithRelations[]> => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: { select: { name: true } },
        store: { select: { name: true } },
      },
    });

    return safeObject(products as ProductWithRelations[]);
  });
}

export async function getProductById(id?: number): Promise<ProductWithRelations | null> {
  return cache(`product-${id || "detail"}`, async (): Promise<ProductWithRelations | null> => {
    const product = await prisma.product.findFirst({
      where: { id },
      include: {
        _count: { select: { images: true } },
        category: true,
        store: true,
        discount: true,
        statistic: true,
      },
    });

    return safeObject(product);
  });
}

export async function getProducts(opt?: {
  cursor?: string;
  store?: string;
  ids?: number[];
  limit?: number;
}): Promise<ProductWithRelations[]> {
  const cacheKey = `products-${opt?.cursor || "start"}-${opt?.store || "all"}-${opt?.ids ? opt.ids.join("-") : "all"}-${opt?.limit || 30}`;
  return cache(cacheKey, async () => {
    const products = await prisma.product.findMany({
      ...(opt?.store && {
        where: { store: { slug: opt.store } },
      }),
      ...(opt?.ids && {
        where: { id: { in: opt.ids } },
      }),

      take: opt?.limit || 30,
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
      ...(opt?.cursor && {
        skip: 1,
        cursor: { slug: opt?.cursor },
      }),
    });

    return safeObject(products);
  });
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
