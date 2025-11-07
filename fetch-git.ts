import { tool } from '@anthropic-ai/claude-agent-sdk';
import { simpleGit } from 'simple-git'

const repoUrl = 'http://bitovi.github.com/bitovi/status-reports';

// export const fetchGit = tool('fetch_github_repo', 'Fetches the content of a Github repo', {}, async (args) => {
//   console.log('it works');
//   try {
//     const gitClient = simpleGit(repoUrl);
//     // const repo = await gitClient.fetch()
//     const status = await gitClient.status();

//     console.log({status})

//   } catch (e) {
//     console.log("Error on on fetchGit", e)
//   }
// })

import { query, type Options } from '@anthropic-ai/claude-agent-sdk';

export async function fetchGit(options: Options) {
    const gitClient = simpleGit(repoUrl);
//     // const repo = await gitClient.fetch()
    const status = await gitClient.status();
    const prompt = `Please, tell me more about the git status: ${status}`;

    let finalMsg: unknown;
    for await (const msg of query({options, prompt})) {
        if(msg.type === 'result') {
            finalMsg = msg;
        }
    }
    console.log('Instruction generation completed', finalMsg);
}