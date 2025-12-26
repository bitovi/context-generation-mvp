import * as path from "path";
import * as fs from "fs/promises";
import { simpleGit } from "simple-git";
import { loadConfig } from "./config";
import {
  query,
  type Options,
  type SDKResultMessage,
} from "@anthropic-ai/claude-agent-sdk";

export async function compareRunner(configFilePath: string) {
  const config = loadConfig(configFilePath);
  console.log("Loaded config:", config);

  const instructionsPath = path.join(".", "tmp", config.instructionFileName);

  try {
    await fs.access(instructionsPath);
  } catch {
    throw new Error(
      "Instructions file not found. Please run context generation first."
    );
  }

  const repoName = config.repo.split("/").pop()?.replace(".git", "") ?? "";
  const featurePath = path.join(".", "repo-tmp", "feature", repoName);

  try {
    await fs.access(featurePath);
  } catch {
    throw new Error(
      "Feature repository not found. Please run context generation and prompt runner first."
    );
  }

  const featureGit = simpleGit(featurePath);

  let diff;

  // if is PR, compare featureGit to prTarget branch
  const isPR = /^https?:\/\//.test(config.base);
  if (isPR) {
    console.log(
      `Base is a PR, comparing feature branch to prTarget branch: ${config.prTarget}`
    );
    diff = await featureGit.diff([`origin/${config.prTarget}`]);
  } else {
    console.log("Base is not a PR, comparing feature branch to base branch");
    diff = await featureGit.diff([`origin/${config.base}`]);
  }

  // Read current instructions
  const currentInstructions = await fs.readFile(instructionsPath, "utf-8");

  // Read compare prompt template
  const comparePromptPath = path.join(".", "COMPARE.md");
  const comparePromptTemplate = await fs.readFile(comparePromptPath, "utf-8");

  // Replace placeholders in the template
  const prompt = comparePromptTemplate
    .replace("{{CURRENT_INSTRUCTIONS}}", currentInstructions)
    .replace("{{DIFF}}", diff);

  const options: Options = {
    permissionMode: "bypassPermissions",
    model: "claude-sonnet-4-20250514",
    cwd: "./",
    settingSources: ["project"],
    allowedTools: ["Read", "Write"],
    maxBudgetUsd: 5.0,
  };

  let finalMsg: SDKResultMessage | undefined = undefined;
  let suggestions = "";
  let verbose = true;

  for await (const msg of query({ options, prompt })) {
    switch (msg.type) {
      case "result":
        finalMsg = msg;
        if (msg.subtype === "success") {
          suggestions = msg.result;
        }
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
    if (finalMsg.subtype === "success") {
      console.info(finalMsg.result, { cost: finalMsg.total_cost_usd });
    }
    const suggestionsPath = path.join(
      ".",
      "tmp",
      "instructions-suggestions.md"
    );
    await fs.writeFile(suggestionsPath, suggestions, "utf-8");
    console.log(`Suggestions saved to ${suggestionsPath}`);
  }
}
