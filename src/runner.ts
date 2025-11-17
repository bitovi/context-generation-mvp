import { checkoutRepo } from "./code-checkout.js";
import { loadConfig } from "./config.js";


export async function contextGenerationRunner(configFilePath: string) {
    const config = loadConfig(configFilePath);
    console.log('Loaded config:', config);

    await checkoutRepo('./repo-tmp/base', config.repo, config.baseBranch);
    await checkoutRepo('./repo-tmp/feature', config.repo, config.featureBranch);
}