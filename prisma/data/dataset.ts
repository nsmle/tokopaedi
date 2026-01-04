import { file } from "bun";
import { parse } from "csv-parse";

export type Dataset = {
  id: number;
  name: string;
  description: string;
  min_order: number;
  max_order: number;
  weight: number;
  weight_unit: string;
  condition: string;
  status: string;
  applink: string;
  url: string;
  thumbnail: string;
  images: string[];
  price: number;
  price_text: string;
  price_slash_text: string;
  discount_percent: number;
  shop_id: number;
  shop_url: string;
  shop_city: string;
  shop_name: string;
  shop_applink: string;
  shop_reputation: string;
  warehouse_id: number;
  parent_product_id: number;
  category_id: number;
  category_name: string;
  category_url: string;
  transaction_success: number;
  transaction_reject: number;
  sold_count: number;
  sold_count_text: string;
  view_count: number;
  review_count: number;
  talk_count: number;
  rating: number;
};

const head = [
  "id",
  "name",
  "description",
  "min_order",
  "max_order",
  "weight",
  "weight_unit",
  "condition",
  "status",
  "applink",
  "url",
  "thumbnail",
  "images",
  "price",
  "price_text",
  "price_slash_text",
  "discount_percent",
  "shop_id",
  "shop_url",
  "shop_city",
  "shop_name",
  "shop_applink",
  "shop_reputation",
  "warehouse_id",
  "parent_product_id",
  "category_id",
  "category_name",
  "category_url",
  "transaction_success",
  "transaction_reject",
  "sold_count",
  "sold_count_text",
  "view_count",
  "review_count",
  "talk_count",
  "rating",
];

export const getDataset = async (): Promise<Dataset[]> => {
  const csvDataset = await file("prisma/data/products.csv").text();
  const csv = parse(csvDataset, { delimiter: "," });

  const data: Dataset[] = [];

  for await (const record of csv) {
    if (record[0] == "id") continue;

    const product: Dataset = {} as Dataset;
    for (let i = 0; i < head.length; i++) {
      const headTitle = head[i] as keyof Dataset;
      if (headTitle === "images") {
        product[headTitle] = JSON.parse(record[i] || "[]") as string[];
      } else {
        const value = record[i];
        // prettier-ignore
        if (["id","min_order","max_order","weight","price","discount_percent","shop_id","warehouse_id","parent_product_id","category_id","transaction_success","transaction_reject","sold_count","view_count","review_count","talk_count",].includes(headTitle)) {
          (product as any)[headTitle] = value?.length ? Number(value?.replace("%", "")) : null;
        } else if (headTitle === "rating") {
          product[headTitle] = parseFloat(value);
        } else {
          (product as any)[headTitle] = value?.length ? value?.replaceAll("\\n", "\n") : null;
        }
      }
    }
    data.push(product);
  }

  return data;
};
