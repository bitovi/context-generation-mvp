import { simpleGit } from 'simple-git';
import path from 'path';

import { createDirCleanIfExistsSync } from './clean.js';

/**
 * Checks out branch of a git repo into targetPath
 * 
 * @param targetPath Base path to check branches into
 * @param repoUrl 
 * @param branch 
 */
export async function checkoutRepo(targetPath: string, repoUrl: string, branch: string) {
    createDirCleanIfExistsSync(targetPath);
    
    let git = simpleGit(targetPath, {});
    await git.clone(repoUrl);
    const repoName = repoUrl.split('/').pop()?.replace('.git', '')  ?? '';
    git = simpleGit(path.join(targetPath, repoName), {});
    await git.fetch();
    await git.checkout(branch);
    
}
