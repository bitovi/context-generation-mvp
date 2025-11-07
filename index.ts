import {Anthropic} from '@anthropic-ai/sdk';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env');



const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function main() {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, Claude" }],
  });
  console.log(msg);
}

main();