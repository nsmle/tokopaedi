import { getProducts, type ProductWithRelations } from "@src/lib/data";
import { recommender } from "./lib/recommender";

// --- Parameter Evaluasi ---
const K_LIST = [10, 15, 20, 30, 50, 100];
const THRESHOLD = 0.85;
const SAMPLE_SIZES = [5, 10, 20, 30, 40, 50];
const VERBOSE = false;

// --- Utilitas ---

function precision(recommended: number[], relevant: number[]): number {
  const hit = recommended.filter((id) => relevant.includes(id)).length;
  return recommended.length === 0 ? 0 : hit / recommended.length;
}

function recall(recommended: number[], relevant: number[]): number {
  const hit = recommended.filter((id) => relevant.includes(id)).length;
  return relevant.length === 0 ? 0 : hit / relevant.length;
}

function f1(p: number, r: number): number {
  return p + r === 0 ? 0 : (2 * p * r) / (p + r);
}

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function meanAveragePrecision(recommended: number[], relevant: number[]): number {
  let hit = 0,
    sum = 0;
  recommended.forEach((id, idx) => {
    if (relevant.includes(id)) {
      hit++;
      sum += hit / (idx + 1);
    }
  });
  return relevant.length === 0 ? 0 : sum / relevant.length;
}

// --- Ground Truth Generator ---
async function generateGroundTruth(
  products: ProductWithRelations[],
  threshold: number,
  sample: number,
): Promise<{ query: number; relevant: number[] }[]> {
  const sampled = products.sort(() => 0.5 - Math.random()).slice(0, sample);

  await recommender.init();
  const groundTruth = Promise.all(
    sampled.map(async (prod) => {
      const termsA = await recommender.getTerms(Number(prod.id));
      if (!termsA) return { query: Number(prod.id), relevant: [] };
      const similarities = await Promise.all(
        products.map(async (other) => {
          if (Number(other.id) === Number(prod.id)) return null;
          const termsB = await recommender.getTerms(Number(other.id));
          if (!termsB) return null;
          const sim = recommender.cosineSimilarity(termsA, termsB);

          if (VERBOSE)
            console.log(`Similarity between Sample Product ${Number(prod.id)} and Product ${Number(other.id)}: ${Number(sim).toFixed(3)}`);
          return { id: Number(other.id), sim };
        }),
      );
      const filtered = similarities.filter((x) => x && x.sim >= threshold) as { id: number; sim: number }[];
      return {
        query: Number(prod.id),
        relevant: filtered.map((x) => Number(x.id)),
      };
    }),
  );

  return groundTruth;
}

// --- Evaluasi ---
async function runEvaluation(sampleSize: number) {
  console.log(`\n\x1b[0;2;35m========================================\x1b[0m`);
  console.log(`\x1b[0;34mEVALUASI DENGAN SAMPLE SIZE: ${sampleSize}\x1b[0m`);
  console.log(`\x1b[0;2;35m========================================\x1b[0m`);

  await recommender.init();

  const products = await getProducts(); // Ambil seluruh produk
  const groundTruth = await generateGroundTruth(products, THRESHOLD, sampleSize); // Generate ground truth

  console.log(`Evaluasi pada ${groundTruth.length} query`);

  const allResults = [];

  for (const K of K_LIST) {
    const pList: number[] = [],
      rList: number[] = [],
      f1List: number[] = [],
      mapList: number[] = [],
      simList: number[] = [];

    for (const gt of groundTruth) {
      // Dapatkan rekomendasi dari recommender
      const recs = (await recommender.recommendations(gt.query, K)).map((x) => x.productId);
      // Hitung similarity rata-rata
      const queryTerms = await recommender.getTerms(gt.query);
      const avgSim =
        queryTerms && recs.length > 0
          ? mean(
              await Promise.all(
                recs.map(async (id) => {
                  const terms = await recommender.getTerms(id);
                  return terms && queryTerms ? recommender.cosineSimilarity(queryTerms, terms) : 0;
                }),
              ),
            )
          : 0;
      const p = precision(recs, gt.relevant);
      const r = recall(recs, gt.relevant);
      const f = f1(p, r);
      const map = meanAveragePrecision(recs, gt.relevant);
      pList.push(p);
      rList.push(r);
      f1List.push(f);
      mapList.push(map);
      simList.push(avgSim);
      if (VERBOSE)
        console.log(
          `[Q:${gt.query}] P=${(p * 100).toFixed(1)} R=${(r * 100).toFixed(1)} F1=${(f * 100).toFixed(1)} MAP=${(map * 100).toFixed(1)} Sim=${avgSim.toFixed(3)}`,
        );
    }

    const log = (title: string, value: number, isPct: boolean = true) =>
      console.log(
        `\x1b[0;32m${title.padStart(10)}`,
        "\x1b[1;30m:\x1b[0;36m",
        value.toFixed(2) + (isPct ? "\x1b[0;2;36m%\x1b[0m" : "\x1b[0m"),
      );

    console.log(`\n\x1b[0;2;35m============= \x1b[0;34mEVALUASI \x1b[0;31mK\x1b[2m=\x1b[0;31m${K} \x1b[0;2;35m=============`);
    const precisionVal = mean(pList) * 100;
    const recallVal = mean(rList) * 100;
    const f1Val = mean(f1List) * 100;
    const mapVal = mean(mapList) * 100;
    const avgSimVal = mean(simList);

    log("Precision", precisionVal);
    log("Recall", recallVal);
    log("F1-Score", f1Val);
    log("MAP", mapVal);
    log("AvgSim", avgSimVal, false);

    allResults.push({
      SampleSize: sampleSize,
      K: K,
      Precision: precisionVal.toFixed(2),
      Recall: recallVal.toFixed(2),
      "F1-Score": f1Val.toFixed(2),
      MAP: mapVal.toFixed(2),
      AvgSim: avgSimVal.toFixed(3),
    });
  }

  console.table(allResults);
  return allResults;
}

async function main() {
  const allResults = [];

  for (const sampleSize of SAMPLE_SIZES) {
    const results = await runEvaluation(sampleSize);
    allResults.push(...results);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Print summary table
  console.log(`\n\x1b[0;2;35m========================================================\x1b[0m`);
  console.log(`\x1b[0;34mSUMMARY EVALUASI SEMUA SAMPLE SIZE\x1b[0m`);
  console.log(`\x1b[0;2;35m========================================================\x1b[0m`);
  console.table(allResults);
}

main();
