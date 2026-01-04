import {
  type Category,
  type Discount,
  type Product,
  type ProductImage,
  type Statistic,
  type Store,
} from "@prisma/client";
import prisma from "@src/lib/prisma";
import "dotenv/config";
import { getDataset } from "./data/dataset";

const items = await getDataset();

// Store Seeder
const stores = items.map(
  (item): Store => ({
    id: BigInt(item.shop_id),
    slug:
      item.shop_url.split("/").filter(Boolean).pop() || item.shop_id.toString(),
    name: item.shop_name,
    city: item.shop_city,
    url: item.shop_url,
    reputation: item.shop_reputation,
    warehouseId: BigInt(item.warehouse_id),
  }),
);

// Category Seeder
const categories = items.map(
  (item): Category => ({
    id: BigInt(item.category_id),
    slug:
      item.category_url.split("/").filter(Boolean).pop() ||
      item.category_id.toString(),
    name: item.category_name,
    url: item.category_url,
  }),
);

// Image Seeder
const images = items.flatMap((item): ProductImage[] =>
  item.images.map(
    (imageUrl, index): ProductImage => ({
      id: `${item.id}_${index + 1}`,
      productId: BigInt(item.id),
      url: imageUrl.replace("images/", ""),
    }),
  ),
);

// Discount Seeder
const discounts = items
  .filter((item): boolean => item.discount_percent !== null)
  .map(
    (item): Pick<Discount, "productId" | "percentage"> => ({
      productId: BigInt(item.id),
      percentage: item.discount_percent,
    }),
  );

// Statistic Seeder
const statistics = items.map(
  (item): Omit<Statistic, "id"> => ({
    productId: BigInt(item.id),
    success: item.transaction_success,
    reject: item.transaction_reject,
    sold: item.sold_count,
    view: item.view_count,
    review: item.review_count,
    talk: item.talk_count,
    rating: item.rating,
  }),
);

// Product Seeder
const products = items.map(
  (item): Product => ({
    id: BigInt(item.id),
    slug: item.url.split("/").filter(Boolean).pop() || item.id.toString(),
    parentId: BigInt(item.parent_product_id),
    name: item.name,
    description: item.description,
    minOrder: item.min_order,
    maxOrder: item.max_order,
    weight: item.weight,
    weightUnit: item.weight_unit,
    condition: item.condition,
    status: item.status,
    url: item.url,
    thumbnail: item.thumbnail.replace("thumbnails/", ""),
    price: item.price,
    storeId: BigInt(item.shop_id),
    categoryId: BigInt(item.category_id),
  }),
);

/**
 * ========================
 *      Seeding Data
 * ========================
 */

const seeding = async () => {
  const dataSeed = [
    { model: "store", data: stores },
    { model: "category", data: categories },
    { model: "productImage", data: images },
    { model: "discount", data: discounts },
    { model: "statistic", data: statistics },
    { model: "product", data: products },
  ];

  for (const { model, data } of dataSeed) {
    console.log(`Seeding ${model}...`);
    const createManyResult = await (prisma as any)[model].createMany({
      data: data,
      skipDuplicates: true,
    });
    console.log(`Seeded ${createManyResult.count} ${model}.\n\n`);
  }

  console.log("Seeding completed.");
};

try {
  await seeding();
  await prisma.$disconnect();
} catch (error: unknown) {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
}
