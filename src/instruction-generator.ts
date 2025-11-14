import { query, type Options } from '@anthropic-ai/claude-agent-sdk';

export async function generateInstructions(chainPath: string, srcPath: string, outputPath: string, finalInstructionFile: string, options: Options) {
    const prompt = `Please execute the prompts found in "${chainPath}" on the code within "${srcPath}". Use "${outputPath}" as the output_folder, and "${finalInstructionFile}" as the final_output_file`;
    console.log('Starting instruction generation');

    let finalMsg: unknown;
    for await (const msg of query({options, prompt})) {
        if(msg.type === 'result') {
            finalMsg = msg;
        }
    }
    console.log('Instruction generation completed', finalMsg);

}