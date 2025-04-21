import { cohere } from "@ai-sdk/cohere";
import { AstraVector } from "@mastra/astra";
import { Memory } from "@mastra/memory";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const embedder = cohere.embedding("embed-english-v3.0");

export const vector = new AstraVector({
	token: process.env.ASTRA_DB_TOKEN ?? "",
	endpoint: process.env.ASTRA_DB_ENDPOINT ?? "",
	keyspace: process.env.ASTRA_DB_KEYSPACE ?? "",
});

export const memory = new Memory({
	embedder,
	vector,
});

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

export const model = openrouter("google/gemini-2.5-pro-preview-03-25");
