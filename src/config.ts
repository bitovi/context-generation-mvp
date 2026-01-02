import { readFileSync } from "fs";
import { parse } from "yaml";

export type Config = {
  repo: string;
  base: string;
  featureBranch: string;
  prTarget?: string;
  instructionFileName?: string;
  promptFilePath: string;
  maxLines?: number;
};

export function loadConfig(yamlPath: string): Config {
  const data = readFileSync(yamlPath, "utf8");
  const config = parse(data);

  const {
    repo,
    base,
    featureBranch,
    prTarget,
    promptFilePath,
    instructionFileName,
    maxLines,
  } = config;

  if (repo === undefined || base == undefined || featureBranch == undefined) {
    throw new Error(
      "Invalid config file, repo, base, and featureBranch are required"
    );
  }

  return {
    repo,
    base,
    featureBranch,
    prTarget,
    promptFilePath: promptFilePath ?? "./PROMPT.md",
    instructionFileName: instructionFileName ?? "instructions.md",
    maxLines: maxLines ?? 100,
  };
}
