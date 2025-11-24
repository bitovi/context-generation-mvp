import { query, type Options } from '@anthropic-ai/claude-agent-sdk';


export async function generateInstructions(srcPath: string, outputPath: string, finalInstructionFile: string) {
    const options: Options = {
        permissionMode: 'bypassPermissions',
        cwd: './',
        settingSources: ['project'],
        allowedTools: ["Skill", "Read", "Write"]
    }

    const prompt = `Please execute skill 1-determine-techstack on the files in  "${srcPath}". Use "${outputPath}" as the output_folder and "${finalInstructionFile}" as the final_output_file.`;
     let finalMsg: unknown;
    for await (const msg of query({options, prompt})) {
        switch(msg.type) {
            case 'result':
                finalMsg = msg;
                break;                
        }
        
    }
    console.log('Instruction generation completed', finalMsg);
}


// Non-skill-based generation
export async function generateInstructionsFromChain(chainPath: string, srcPath: string, outputPath: string, finalInstructionFile: string, options: Options) {
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