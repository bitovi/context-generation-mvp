import { simpleGit } from 'simple-git';
import path from 'path';

import {mkdirSync, existsSync, rmSync } from 'fs';
import { createDirCleanIfExistsSync } from './clean.js';

export async function checkoutRepo(targetPath: string, repoUrl: string, branch: string) {
    createDirCleanIfExistsSync(targetPath);
    
    let git = simpleGit(targetPath, {});
    await git.clone(repoUrl);
    const repoName = repoUrl.split('/').pop()?.replace('.git', '')  ?? '';
    git = simpleGit(path.join(targetPath, repoName), {});
    await git.fetch();
    await git.checkout(branch);
    
}


// checkoutRepo('./repo-tmp', 'https://github.com/bitovi/ai-enablement-prompts.git','feat/FE-463777');