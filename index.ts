import { query } from '@anthropic-ai/claude-agent-sdk';
import { Anthropic } from '@anthropic-ai/sdk';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env');

// Using anthropic SDK
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, Claude" }],
});
console.log(msg);


// Using claude agent sdk
for await(const qMsg of query({prompt: "Hello, Claude"})) {
    console.log(qMsg)
};
