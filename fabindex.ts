import { query, type Options } from '@anthropic-ai/claude-agent-sdk';
import { exampleTool } from '../example-tool.js';

const options: Options = {
    permissionMode: 'bypassPermissions', // this is what we need
    // model: "claude-3-haiku-20240307",
}
export async function generateInstructions(chainPath: string, outputPath: string, finalInstructionFile: string, options: Options) {
    const prompt = `Please execute the prompts found in "${chainPath}". Use "${outputPath}" as the output_folder, and "${finalInstructionFile}" as the final_output_file`;
    const promptTest = 'list me the mcp servers and run exampleTool.'
    console.log('Starting instruction generation');

    let finalMsg: unknown;
    for await (const msg of query({options, prompt: promptTest})) {
        if(msg.type === 'result') {
            finalMsg = msg;
        }
        console.log(msg);
    }
    console.log('Instruction generation completed', finalMsg);

}