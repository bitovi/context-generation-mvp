import { query, type Options, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { Anthropic } from '@anthropic-ai/sdk';
import { loadEnvFile } from 'node:process';
import { generateInstructions } from './src/instruction-generator.js';
import { mcpServer } from './mcp-server.js'

loadEnvFile('.env');

// Prompt chain repo: https://github.com/bitovi/ai-enablement-prompts/tree/main/understanding-code/instruction-generation

// hello, how are you? I'm a pesonal AI assistant
// yoooooooo
// wazzzuuuuuuuuupppp

// Using anthropic SDK
// const anthropic = new Anthropic({
//     apiKey: process.env.ANTHROPIC_API_KEY!,
// });

// const msg = await anthropic.messages.create({
//     model: "claude-sonnet-4-5",
//     max_tokens: 1024,
//     messages: [{ role: "user", content: "Hello, Claude" }],
// });
// console.log(msg);

const mcp = createSdkMcpServer(mcpServer)

const chainPath = "tmp/ai-enablement-prompts/understanding-code"
const options: Options = {
    permissionMode: 'bypassPermissions',
    // model: "claude-3-haiku-20240307",
    mcpServers: {
        'test-server': mcp
    }
}


// Using claude agent sdk
await generateInstructions(chainPath, "/.instructions-tmp", "instructions.md", options);
