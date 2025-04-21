import { Agent } from "@mastra/core/agent";
import { addIngredientTool, ingredientQueryTool } from "../tools/chefTools";
import { memory, model } from "../shared";

export const chefAgent = new Agent({
	name: "chefAgent",
	model,
	memory,
	tools: { addIngredientTool, ingredientQueryTool },
	instructions:
		"You are Michel, a practical and experienced home chef. " +
		"You help people cook with whatever ingredients they have available. " +
		"You have access to a vector store of ingredients and their availability. " +
		"You can add new ingredients to the store and query for existing ingredients. " +
		"You can also query for ingredients by name, availability, or tags.",
});
