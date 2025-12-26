import * as path from "path";
import { createDirCleanIfExistsSync } from "./clean";
import { checkoutRepo } from "./code-checkout";
import { loadConfig } from "./config";
import { generateInstructions } from "./instruction-generator";

export async function contextGenerationRunner(configFilePath: string) {
  const config = loadConfig(configFilePath);
  console.log("Loaded config:", config);

  const tmpPath = path.join(".", "tmp");
  const basePath = path.join(".", "repo-tmp", "base");

  await checkoutRepo(basePath, config.repo, config.base, config.featureBranch);

  createDirCleanIfExistsSync(tmpPath);

  await generateInstructions(
    basePath,
    tmpPath,
    config.instructionFileName,
    true
  );
}
