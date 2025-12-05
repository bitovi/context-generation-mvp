import * as path from "path";
import { createDirCleanIfExistsSync } from "./clean";
import { checkoutRepo } from "./code-checkout";
import { loadConfig } from "./config";
import { generateInstructions } from "./instruction-generator";


export async function contextGenerationRunner(configFilePath: string) {
    const config = loadConfig(configFilePath);
    console.log('Loaded config:', config);

    const tmpPath = path.join('.','tmp');
    const basePath = path.join('.','repo-tmp','base');
    const featurePath = path.join('.','repo-tmp','feature');

    await checkoutRepo(basePath, config.repo, config.baseBranch);
    await checkoutRepo(featurePath, config.repo, config.featureBranch);

    createDirCleanIfExistsSync(tmpPath);

    await generateInstructions(featurePath, tmpPath, 'instructions.md', true);
}