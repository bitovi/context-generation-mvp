import * as path from "path";
import * as fs from "fs/promises";
import { checkoutRepo } from "./code-checkout";
import { loadConfig } from "./config";
import { implementPrompt } from "./implement-prompt.js";

export async function promptRunner(configFilePath: string) {
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

  const featurePath = path.join(".", "repo-tmp", "feature");

  const git = await checkoutRepo(
    featurePath,
    config.repo,
    config.base,
    config.featureBranch
  );

  // Determine if base is a PR (URL) or branch/commit
  const isPR = /^https?:\/\//.test(config.base);

  if (!isPR) {
    // removing last commit
    await git.reset(["--hard", "HEAD~1"]);
    await git.log({ maxCount: 2 }).then((log) => {
      console.log("Latest 2 commits:", log.all);
    });
  } else {
    // find common ancestor between featureBranch and prTarget
    // to-do: fetch PR Target from PR metadata and remove prTarget from config
    const baseCommit = await git.raw([
      "merge-base",
      config.featureBranch,
      `origin/${config.prTarget}`,
    ]);

    // Reset current branch to the merge-base commit
    await git.reset(["--hard", baseCommit.trim()]);
    await git.log({ maxCount: 2 }).then((log) => {
      console.log("Latest 2 commits:", log.all);
    });
  }

  const repoName = config.repo.split("/").pop()?.replace(".git", "") ?? "";
  const instructionsFolder = path.join(`${featurePath}/${repoName}`, ".claude");
  const destinationPath = path.join(instructionsFolder, "CLAUDE.md");
  await fs.mkdir(instructionsFolder, { recursive: true });
  await fs.copyFile(instructionsPath, destinationPath);
  console.log(
    `Copied instructions from ${instructionsPath} to ${destinationPath}`
  );

  await implementPrompt(
    `${featurePath}/${repoName}`,
    config.promptFilePath,
    true
  );
}
