import { tool } from '@anthropic-ai/claude-agent-sdk';

export const exampleTool = tool('example', 'logs data', {}, async (args) => {
  console.log('it works');
  return Promise.resolve({
    content: [{
      type: 'text',
      text: 'Tool run successfully'
    }],
  });
})