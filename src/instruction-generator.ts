import {
  query,
  type Options,
  type SDKResultMessage,
} from "@anthropic-ai/claude-agent-sdk";

// Helper function to run a single skill
async function runSkill(
  skillName: string,
  srcPath: string,
  outputPath: string,
  finalInstructionFile: string,
  options: Options,
  verbose?: boolean
): Promise<SDKResultMessage | undefined> {
  const prompt = `
    Please execute skill ${skillName} on the files in "${srcPath}". Use "${outputPath}" as the output_folder and "${finalInstructionFile}" as the final_output_file.
    If this skill takes longer than 15 minutes, stop iterating as soon as possible and move on.
    `;

  console.log(`[${skillName}] Starting...`);
  let finalMsg: SDKResultMessage | undefined = undefined;

  for await (const msg of query({ options, prompt })) {
    switch (msg.type) {
      case "result":
        finalMsg = msg;
        break;
      case "tool_progress":
        if (verbose) {
          console.info(`[${skillName}] tool msg`, { name: msg.tool_name });
        }
        break;
      case "system":
        if (msg.subtype === "hook_response" && verbose) {
          console.info(`[${skillName}] Hook response`, {
            hook: msg.hook_name,
            data: msg.stdout,
          });
        }
        break;
      case "user":
        if (verbose) {
          console.info(`[${skillName}] User message`, msg.message);
        }
        break;
      default:
        if (verbose) {
          console.debug(`[${skillName}] Other message`, msg.type);
        }
    }
  }

  if (finalMsg) {
    if (finalMsg.subtype === "success") {
      console.info(`[${skillName}] Completed successfully`, {
        cost: finalMsg.total_cost_usd,
      });
    } else {
      console.error(`[${skillName}] Failed`, { error: finalMsg.is_error });
    }
  }

  return finalMsg;
}

export async function generateInstructions(
  srcPath: string,
  outputPath: string,
  finalInstructionFile: string,
  verbose?: boolean
) {
  const options: Options = {
    permissionMode: "bypassPermissions",
    model: "claude-sonnet-4-5",
    cwd: "./",
    settingSources: ["project"],
    allowedTools: ["Skill", "Read", "Write"],
    maxBudgetUsd: 1.0,
  };

  console.log('Starting instruction generation with parallel execution for skills 4 & 5');

  try {
    // Sequential execution: Skills 1-3
    await runSkill(
      "1-determine-techstack",
      srcPath,
      outputPath,
      finalInstructionFile,
      options,
      verbose
    );
    await runSkill(
      "2-categorize-files",
      srcPath,
      outputPath,
      finalInstructionFile,
      options,
      verbose
    );
    await runSkill(
      "3-identifying-architecture",
      srcPath,
      outputPath,
      finalInstructionFile,
      options,
      verbose
    );

    // Parallel execution: Skills 4 & 5
    console.log("Starting parallel execution of skills 4 and 5...");
    await Promise.all([
      runSkill(
        "4-domain-deep-dive",
        srcPath,
        outputPath,
        finalInstructionFile,
        options,
        verbose
      ),
      runSkill(
        "5-styleguide-generation",
        srcPath,
        outputPath,
        finalInstructionFile,
        options,
        verbose
      ),
    ]);
    console.log("Parallel execution completed");

    // Final skill: Skill 6
    const finalResult = await runSkill(
      "6-build-instructions",
      srcPath,
      outputPath,
      finalInstructionFile,
      options,
      verbose
    );

    console.info("Instruction generation completed", {
      success: finalResult?.subtype === "success",
    });

    if (finalResult?.subtype === "success") {
      console.info("Final result:", finalResult.result);
    }
  } catch (error) {
    console.error("Instruction generation failed:", error);
    throw error;
  }
}

// Non-skill-based generation
export async function generateInstructionsFromChain(
  chainPath: string,
  srcPath: string,
  outputPath: string,
  finalInstructionFile: string,
  options: Options
) {
  const prompt = `Please execute the prompts found in "${chainPath}" on the code within "${srcPath}". Use "${outputPath}" as the output_folder, and "${finalInstructionFile}" as the final_output_file`;
  console.log("Starting instruction generation");

  let finalMsg: unknown;
  for await (const msg of query({ options, prompt })) {
    if (msg.type === "result") {
      finalMsg = msg;
    }
  }
  console.log("Instruction generation completed", finalMsg);
}
