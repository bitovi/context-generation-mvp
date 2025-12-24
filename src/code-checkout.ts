import { simpleGit, type SimpleGit } from "simple-git";
import * as path from "path";

import { createDirCleanIfExistsSync } from "./clean";

/**
 * Checks out a repo and creates a branch from the appropriate base commit
 *
 * @param targetPath Base path to check branches into
 * @param repoUrl
 * @param base Branch, commit, or PR URL to base off of
 * @param featureBranch Name of the new feature branch to create
 */
export async function checkoutRepo(
  targetPath: string,
  repoUrl: string,
  base: string,
  featureBranch: string
): Promise<SimpleGit> {
  createDirCleanIfExistsSync(targetPath);

  let git = simpleGit(targetPath, {});
  await git.clone(repoUrl);
  const repoName = repoUrl.split("/").pop()?.replace(".git", "") ?? "";
  const repoPath = path.join(targetPath, repoName);
  git = simpleGit(repoPath, {});
  await git.fetch();

  // Determine if base is a PR (URL) or branch/commit
  const isPR = /^https?:\/\//.test(base);

  if (!isPR) {
    // For branch or commit, checkout and create branch from HEAD~1
    await git.checkout(base);
    await git.checkout(["-b", featureBranch]);
    return git;
  }

  const prNumber = base.split("/").pop();
  // fetch and create branch from PR
  await git.fetch("origin", `pull/${prNumber}/head:${featureBranch}`);
  await git.checkout(featureBranch);
  return git;
}
