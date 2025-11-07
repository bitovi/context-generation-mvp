import { simpleGit } from 'simple-git';

export async function checkoutRepo(targetPath: string, repoUrl: string, branch: string) {
    const git = simpleGit(targetPath, {})
    await git.clone(repoUrl);
    await git.fetch();
    await git.checkoutLocalBranch(branch);
    
}

// may be broken becuase of nested repo folders?
checkoutRepo('./repo-tmp', 'https://github.com/bitovi/ai-enablement-prompts.git','feat/FE-463777');