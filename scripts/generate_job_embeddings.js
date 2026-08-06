const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const opportunitiesPath = path.join(projectRoot, "data", "opportunities.json");
const enrichedPath = path.join(projectRoot, "data", "enriched_opportunities.json");
const outputPath = path.join(projectRoot, "data", "job_embeddings.json");

const apiKey = process.env.OPENROUTER_API_KEY || "";
const model = process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small";

if (!apiKey) {
  console.error("OPENROUTER_API_KEY is required.");
  process.exit(1);
}

function jobText(record, enriched) {
  return [
    `Title: ${record.title || ""}`,
    `Category: ${record.category || ""}`,
    `Location: ${record.location || record.state || ""}`,
    `Education: ${record.min_education_hard || ""}`,
    `Skills: ${(record.skills_normalized || []).join(", ")}`,
    `Summary: ${enriched?.summary || ""}`,
    `Daily work: ${(enriched?.daily_work || []).join(" ")}`,
    `Description: ${String(record.description || "").slice(0, 1200)}`
  ].join("\n");
}

async function embedBatch(inputs) {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, input: inputs })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.data.map((item) => item.embedding);
}

async function main() {
  const records = JSON.parse(fs.readFileSync(opportunitiesPath, "utf8"));
  const enriched = fs.existsSync(enrichedPath) ? JSON.parse(fs.readFileSync(enrichedPath, "utf8")) : [];
  const enrichedById = new Map(enriched.map((item) => [item.id, item]));
  const output = [];
  const batchSize = 32;

  for (let index = 0; index < records.length; index += batchSize) {
    const batch = records.slice(index, index + batchSize);
    const inputs = batch.map((record) => jobText(record, enrichedById.get(record.id)));
    console.log(`Embedding ${index + 1}-${index + batch.length} of ${records.length}`);
    const embeddings = await embedBatch(inputs);
    batch.forEach((record, batchIndex) => {
      output.push({
        id: record.id,
        title: record.title,
        source_name: record.source_name,
        embedding: embeddings[batchIndex]
      });
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`Wrote ${output.length} embeddings to ${outputPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
