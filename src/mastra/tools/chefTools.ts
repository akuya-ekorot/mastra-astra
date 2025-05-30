import { createTool } from "@mastra/core";
import { z } from "zod";
import { embedMany } from "ai";
import { createVectorQueryTool } from "@mastra/rag";
import { embedder, model } from "../shared";

export type Ingredient = {
	name: string;
	availability: "in_stock" | "out_of_stock";
	tags: string[];
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
							.enum(["in_stock", "out_of_stock"])
							.describe("Availability status"),
						tags: z.array(z.string()).describe("Tags for the ingredient"),
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

		// Embed all ingredients at once
		const embeddings = await embedMany({
			model: embedder,
			values: ingredients.map((ing) => ing.name),
		});

		const indexes = await vector.listIndexes();

		if (!indexes.includes("ingredients")) {
			await vector.createIndex({
				indexName: "ingredients",
				dimension: 1024, // should match the dimensions of the embedding model used
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
