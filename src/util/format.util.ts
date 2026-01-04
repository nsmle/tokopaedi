export function safeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item): T => safeObject(item)) as T;
  }

  if (typeof obj === "bigint") {
    return Number(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item): T => safeObject(item)) as T;
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = safeObject(obj[key]);
    }
    return result as T;
  }

  return obj;
}

export const discountedPrice = (price?: number, discountPercentage?: number): number => {
  if (!price) return 0;
  if (!discountPercentage) return price;
  return price - (discountPercentage / 100) * price;
};

export function humanizeNumber(num?: number, fractionDigit: number = 1): string {
  if (num === undefined || num === null) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(fractionDigit).replace(/\.0$/, "") + "jt";
  if (num >= 1_000) return (num / 1_000).toFixed(fractionDigit).replace(/\.0$/, "") + "rb";
  if (num >= 100) return num + "+";

  return num.toString();
}
