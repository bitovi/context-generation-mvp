import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

const isCI = process.env.GITHUB_ACTIONS === 'true';
const describeIfNotCI = isCI ? describe.skip : describe;

describeIfNotCI('Anthropic API', () => {
  test('sends a prompt and receives a response', async () => {
    const apiKey = process.env.ANTHROPIC_TEST_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_TEST_KEY is not set in environment variables');
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'What is 2 + 2? Reply with just the number.',
        },
      ],
    });

    expect(message.content).toBeDefined();
    expect(message.content.length).toBeGreaterThan(0);
    
    const textContent = message.content.find(block => block.type === 'text');
    expect(textContent).toBeDefined();
    
    if (textContent && textContent.type === 'text') {
      expect(textContent.text).toContain('4');
    }
  });

  test('reads a TypeScript file and describes it correctly', async () => {
    const apiKey = process.env.ANTHROPIC_TEST_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_TEST_KEY is not set in environment variables');
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Read the hello.ts file
    const filePath = path.join(__dirname, 'hello.ts');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Please describe what this TypeScript code does:\n\n${fileContent}`,
        },
      ],
    });

    expect(message.content).toBeDefined();
    expect(message.content.length).toBeGreaterThan(0);
    
    const textContent = message.content.find(block => block.type === 'text');
    expect(textContent).toBeDefined();
    
    if (textContent && textContent.type === 'text') {
      const response = textContent.text.toLowerCase();
      // Check that the description mentions console.log or hello world
      expect(
        response.includes('console') || 
        response.includes('hello') || 
        response.includes('print') ||
        response.includes('log')
      ).toBe(true);
    }
  });
});
