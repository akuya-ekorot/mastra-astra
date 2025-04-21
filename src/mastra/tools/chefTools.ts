import { createTool } from "@mastra/core";
import { z } from "zod";
import { embedMany } from "ai";
import { createVectorQueryTool } from "@mastra/rag";
import { embedder } from "../shared";
import { model } from "../shared";

// Ingredient type for type safety
export type Ingredient = {
	name: string;
	availability: "in_stock" | "out_of_stock" | "seasonal";
	tags: string[];
	quantityAvailable: number;
	dietTypes: string[];
};

export const addIngredientTool = createTool({
	id: "addIngredientTool",
	description: "Add a new ingredient to the vector store",
	inputSchema: z
		.object({
			ingredients: z
				.array(
					z.object({
						name: z.string().describe("Name of the ingredient"),
						availability: z
							.enum(["in_stock", "out_of_stock", "seasonal"])
							.describe("Availability status"),
						tags: z.array(z.string()).describe("Tags for the ingredient"),
						quantityAvailable: z
							.number()
							.describe("Quantity available (grams or pieces)"),
						dietTypes: z
							.array(z.string())
							.describe("Diet types (e.g., vegan, keto, etc.)"),
					}),
				)
				.describe("List of ingredients to add"),
		})
		.describe("Add multiple ingredients to the vector store"),
	execute: async ({ context, mastra }) => {
		const { ingredients } = context;

		const memory = mastra?.getAgent("chefAgent").getMemory();
		const embedder = memory?.embedder;
		const vector = memory?.vector;

		if (!vector || !embedder) {
			return { error: "Vector store or embedder not found" };
		}

		// Prepare JSON strings for embedding
		const ingredientJsons = ingredients.map((ing) => ing.name);

		// Embed all ingredients at once
		const embeddings = await embedMany({
			model: embedder,
			values: ingredientJsons,
		});

		const indexes = await vector.listIndexes();

		if (!indexes.includes("ingredients")) {
			await vector.createIndex({
				indexName: "ingredients",
				dimension: 1024,
			});
		}

		const result = await vector.upsert({
			indexName: "ingredients",
			vectors: embeddings.embeddings,
			metadata: ingredients,
		});

		return { result };
	},
});

export const ingredientQueryTool = createVectorQueryTool({
	vectorStoreName: "vector", // as configured in mastra
	indexName: "ingredients",
	model: embedder,
	id: "ingredientQueryTool",
	description: "Query the vector store for ingredients",
	reranker: {
		model,
		options: {
			weights: {
				semantic: 0.5,
				vector: 0.3,
				position: 0.2,
			},
			topK: 5,
		},
	},
});
