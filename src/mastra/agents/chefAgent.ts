import { Agent } from "@mastra/core/agent";
import { addIngredientTool, ingredientQueryTool } from "../tools/chefTools";
import { memory } from "../shared";
import { model } from "../shared";

export const chefAgent = new Agent({
	name: "chefAgent",
	instructions:
		"You're a chef assistant that helps users with their cooking needs.",
	model,
	memory,
	tools: { addIngredientTool, ingredientQueryTool },
});
