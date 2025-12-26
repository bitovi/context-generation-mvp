import { query, type Options, type SDKResultMessage } from '@anthropic-ai/claude-agent-sdk';


export async function generateInstructions(srcPath: string, outputPath: string, finalInstructionFile: string, verbose?: boolean) {
    const options: Options = {
        permissionMode: 'bypassPermissions',
        model: 'claude-haiku-4-5',
        cwd: './',
        settingSources: ['project'],
        allowedTools: ["Skill", "Read", "Write"],
        maxBudgetUsd: 5.0,
    }

    console.log('Starting instruction generation');

    const prompt = `
    Please execute skill 1-determine-techstack on the files in "${srcPath}". Use "${outputPath}" as the output_folder and "${finalInstructionFile}" as the final_output_file. 
    Continue working through each step, each of which is represented by a separate skill until all 6 have run and a final instruction file is built.
    If any skill takes longer than 15 minutes, stop iterating on that skill as soon as possible and move on to the next step. Keep track of any skills that must be ended early and mention them at the end of the process.
    `;
    let finalMsg: SDKResultMessage | undefined = undefined;

    for await (const msg of query({ options, prompt })) {
        switch (msg.type) {
            case 'result':
                finalMsg = msg;
                break;
            case 'tool_progress':
                if (verbose) {
                    console.info(`tool msg`, { name: msg.tool_name });
                }
                break;
            case 'system':
                if (msg.subtype === 'hook_response' && verbose) {
                    console.info('Hook response', { hook: msg.hook_name, data: msg.stdout });
                }
                break;
            case 'user':
                if (verbose) {
                    console.info('User message', msg.message);
                }
                break;
            default:
                if (verbose) {
                    console.debug('Other message', msg.type);
                }

        }

    }

    if (finalMsg) {
        console.info('Instruction generation completed', { success: !finalMsg.is_error });
        if (finalMsg.subtype === 'success') {
            console.info(finalMsg.result, { cost: finalMsg.total_cost_usd });
        }
    }

}


// Non-skill-based generation
export async function generateInstructionsFromChain(chainPath: string, srcPath: string, outputPath: string, finalInstructionFile: string, options: Options) {
    const prompt = `Please execute the prompts found in "${chainPath}" on the code within "${srcPath}". Use "${outputPath}" as the output_folder, and "${finalInstructionFile}" as the final_output_file`;
    console.log('Starting instruction generation');

    let finalMsg: unknown;
    for await (const msg of query({ options, prompt })) {
        if (msg.type === 'result') {
            finalMsg = msg;
        }
    }
    console.log('Instruction generation completed', finalMsg);

}