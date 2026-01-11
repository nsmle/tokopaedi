import { getProductById, getProductsForRecommender, type ProductWithRelations } from "@src/lib/data";
import { STOPWORDS } from "@src/util/stopwords.util";
import { AggressiveTokenizerId, StemmerId, TfIdf, type TfIdfDocument, type TfIdfTerm } from "natural";

export class Recommender {
  private tfIdf: TfIdf;
  private tfIdfIndex: Map<number, number>;

  constructor() {
    this.tfIdf = new TfIdf();
    this.tfIdfIndex = new Map<number, number>();
  }

  async init(): Promise<void> {
    if (this.tfIdf.documents.length === 0) await this.loadTFIdfMatrix();
  }

  async loadTFIdfMatrix(): Promise<void> {
    const products = await getProductsForRecommender();
    console.log(` ⚡ [TF-IDF]: Loading TF-IDF matrix with ${products.length} products...`);

    for (const product of products) {
      const tokens = this.preprocessing(product);
      this.addDocument(product.id, tokens);
    }

    console.log(` ⚡ [TF-IDF]: Matrix loaded with ${this.tfIdf.documents.length} documents.`);
  }

  preprocessing(product: ProductWithRelations) {
    // Feature Selection
    let feature = `${product.name || ""} ${product.description || ""} ${product?.category?.name || ""} ${product.store.name || ""}`;

    // Cleaning & Normalization
    feature = feature
      .replace(/<[^>]*>/g, " ") // HTML tags
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, "") // Emoji
      .replace(/[^a-zA-Z\s]/g, " ") // Symbols and numbers
      .replace(/\s+/g, " ") // Extra spaces
      .toLowerCase() // Lowercase
      .trim();

    // Tokenization
    const tokenizer = new AggressiveTokenizerId();
    let tokens = tokenizer.tokenize(feature) as string[];

    // Stopword Removal (Bahasa Indonesia)
    tokens = tokens.filter((word): boolean => !STOPWORDS.has(word));

    // Stemming
    tokens = tokens.map((token): string => StemmerId.stem(token));

    return tokens;
  }

  cosineSimilarity(termsA: TfIdfTerm[], termsB: TfIdfTerm[]): number {
    const dictA: Record<string, number> = {};
    const dictB: Record<string, number> = {};

    for (const term of termsA) dictA[term.term] = term.tfidf;
    for (const term of termsB) dictB[term.term] = term.tfidf;

    const allTerms = new Set<string>([...termsA.map((t): string => t.term), ...termsB.map((t): string => t.term)]);

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const term of allTerms) {
      const valA = dictA[term] || 0;
      const valB = dictB[term] || 0;
      dotProduct += valA * valB;
      magnitudeA += valA * valA;
      magnitudeB += valB * valB;
    }

    return (dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))) * 10; // Scale similarity to 0-10 range
  }

  async recommendations(productId: number | bigint, topN?: number): Promise<Array<{ productId: number; score: number }>> {
    await this.init();

    const targetTerms = await this.getTerms(productId);
    if (!targetTerms) return [];

    const scores: Array<{ productId: number; score: number }> = [];

    // console.log(
    //   ` 🚀 [COSINE-SIMILARITY]: Calculating similarities for Product ID: ${productId} -> Total Documents: ${this.tfIdf.documents.length}`,
    // );

    for (const [otherProductId, index] of this.tfIdfIndex.entries()) {
      // console.log(`Calculating similarity between Product ${productId} and Product ${otherProductId}`);
      if (otherProductId === Number(productId)) continue;
      const otherTerms = this.tfIdf.listTerms(index);
      const score = this.cosineSimilarity(targetTerms, otherTerms);
      scores.push({ productId: otherProductId, score });
    }

    // console.log(` 🚀 [COSINE-SIMILARITY]: Similarities calculated. Product ID: ${productId}  with Results: ${scores.length}`);

    scores.sort((a, b) => b.score - a.score);
    return !topN ? scores : scores.slice(0, topN);
  }

  // ========= UTILITY ==========

  addDocument(productId: number | bigint, tokens: string[]): number {
    this.tfIdf.addDocument(tokens);
    const index = this.tfIdf.documents.length - 1;
    this.tfIdfIndex.set(Number(productId), index);
    return index;
  }

  getDocument(productId: number | bigint): TfIdfDocument | null {
    const index = this.tfIdfIndex.get(Number(productId));
    if (index === undefined) return null;
    return this.tfIdf.documents[index];
  }

  async getTerms(productId: number | bigint): Promise<TfIdfTerm[] | null> {
    let index = this.tfIdfIndex.get(Number(productId));
    if (index === undefined) {
      const product = await getProductById(Number(productId));
      if (!product) return null;

      const tokens = this.preprocessing(product);
      index = this.addDocument(product.id, tokens);
    }

    return this.tfIdf.listTerms(index);
  }
}

const globalForRecommender = global as unknown as {
  recommender: Recommender;
};

export const recommender = globalForRecommender.recommender || new Recommender();
