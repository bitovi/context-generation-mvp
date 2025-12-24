import {
  query,
  type Options,
  type SDKResultMessage,
} from "@anthropic-ai/claude-agent-sdk";
import * as fs from "fs/promises";

export async function implementPrompt(
  srcPath: string,
  promptFile: string,
  verbose?: boolean
) {
  const options: Options = {
    permissionMode: "bypassPermissions",
    model: "claude-haiku-4-5",
    cwd: srcPath,
    settingSources: ["project"],

    allowedTools: ["Read", "Write"],
    maxBudgetUsd: 5.0,
  };

  console.log("Starting prompt implementation");

  console.log("Reading prompt file:", promptFile);

  const prompt = await fs.readFile(promptFile, "utf-8");

  console.log("Using prompt:", prompt);

  let finalMsg: SDKResultMessage | undefined = undefined;

  for await (const msg of query({ options, prompt })) {
    switch (msg.type) {
      case "result":
        finalMsg = msg;
        break;
      case "tool_progress":
        if (verbose) {
          console.info(`tool msg`, { name: msg.tool_name });
        }
        break;
      case "system":
        if (msg.subtype === "hook_response" && verbose) {
          console.info("Hook response", {
            hook: msg.hook_name,
            data: msg.stdout,
          });
        }
        break;
      case "user":
        if (verbose) {
          console.info("User message", msg.message);
        }
        break;
      default:
        if (verbose) {
          console.debug("Other message", msg.type);
        }
    }
  }

  if (finalMsg) {
    console.info("Prompt implementation completed", {
      success: !finalMsg.is_error,
    });
    if (finalMsg.subtype === "success") {
      console.info(finalMsg.result, { cost: finalMsg.total_cost_usd });
    }
  }
}
