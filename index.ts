import { query, type Options, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { Anthropic } from '@anthropic-ai/sdk';
import { loadEnvFile } from 'node:process';
import { generateInstructions } from './src/instruction-generator.js';
import { mcpServer } from './mcp-server.js'

loadEnvFile('.env');


const mcp = createSdkMcpServer(mcpServer)

const chainPath = "tmp/ai-enablement-prompts/understanding-code"
const options: Options = {
    permissionMode: 'bypassPermissions',
    // model: "claude-3-haiku-20240307",
    mcpServers: {
        'test-server': mcp
    },
}


// Using claude agent sdk
await generateInstructions(chainPath, "./", "/.instructions-tmp", "instructions.md", options);
