# context-generation-mvp

## Workflow

This tool helps you generate context-aware instructions for implementing changes in a repository, then applies those changes using an AI agent.

### Setup

1. **Configure the YAML file** - Set up your repository, branches, and settings in `issue-to-context.sample.yaml`

### Scripts

- `npm run context` - Generates context and instructions from the configured repository
- `npm run prompt` - Applies the instructions to implement changes in the repository

### Typical Workflow

1. **Configure** - Edit `issue-to-context.sample.yaml` with your repository settings
2. **Generate Context** - Run `npm run context` to analyze the repository and generate instructions in `/tmp`
3. **Edit Prompt** - Modify `PROMPT.md` with your desired changes
4. **Apply Changes** - Run `npm run prompt` to have the AI implement your prompt
5. **Review & Iterate** - Verify changes, commit, and open PR if satisfied

### Iteration & Flexibility

Since step 5 is manual, you have full control:

- You can manually edit `tmp/instructions.md` and re-run `npm run prompt` (step 4) to start fresh with a new state
- Each run of `npm run prompt` resets the local repository, discarding previous changes
- As long as you don't re-run `npm run context`, you can iterate on the instructions file as many times as needed
- You can even manually create `tmp/instructions.md` and skip context generation entirely, going straight to step 3

### Output Locations

- Temporary repo is checked out into `/repo-tmp`
- Instruction temporary files will be constructed in `/tmp`
