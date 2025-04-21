import { Logger, Mastra } from "@mastra/core";
import { chefAgent } from "./agents/chefAgent";
import { vector } from "./shared";

export const mastra = new Mastra({
	agents: { chefAgent },
	logger: new Logger({ level: "debug" }),
	vectors: { vector },
});
