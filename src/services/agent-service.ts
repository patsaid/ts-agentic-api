// src/services/agent-service.ts
import * as dotenv from "dotenv";
dotenv.config();

import { Agent, run, tool } from "@openai/agents";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// --- Example tool: get weather ---
const getWeatherTool = tool({
  name: "get_weather",
  description: "Get the weather for a given city",
  parameters: z.object({ city: z.string() }),
  execute: async (input) => {
    // Simulate fetching weather
    return `The weather in ${input.city} is sunny and 25°C`;
  },
});

// --- Initialize ChatOpenAI model ---
const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0,
});

// --- Create the agent ---
const agent = new Agent({
  name: "Assistant Agent",
  instructions: "You are a helpful assistant that can answer questions and use tools if needed.",
  tools: [getWeatherTool],
  handoffs: [],
});

/**
 * Run the agent with a question string using tools
 */
export async function runAgent(question: string) {
  const result = await run(agent, question);
  return result.finalOutput;
}

/**
 * Simple chat invocation
 */
export async function simpleChat(message: string) {
  const response = await chatModel.invoke(message);
  return response;
}
