import {readFileSync} from 'fs';
import { parse } from 'yaml';
export type Config = {
    repo: string;
    featureBranch: string;
    baseBranch: string;
    context?: {url: string; name: string; description: string}[]
}

export function loadConfig(yamlPath: string): Config {
    const data = readFileSync(yamlPath, 'utf8');
    const config = parse(data);

    const { repo, featureBranch, baseBranch, context } = config;

    if(repo === undefined || featureBranch == undefined) {
        throw new Error('Invalid config file, repo and featureBranch are required');
    }

    return {
        repo,
        featureBranch,
        baseBranch,
        context
    };
}