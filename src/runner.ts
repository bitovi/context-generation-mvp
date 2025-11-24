import { createDirCleanIfExistsSync } from "./clean.js";
import { checkoutRepo } from "./code-checkout.js";
import { loadConfig } from "./config.js";
import { generateInstructions } from "./instruction-generator.js";


export async function contextGenerationRunner(configFilePath: string) {
    const config = loadConfig(configFilePath);
    console.log('Loaded config:', config);

    await checkoutRepo('./repo-tmp/base', config.repo, config.baseBranch);
    await checkoutRepo('./repo-tmp/feature', config.repo, config.featureBranch);

    createDirCleanIfExistsSync('./tmp');
    
    await generateInstructions('./repo-tmp/feature', './tmp', 'instructions.md');
}