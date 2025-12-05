# Feature Reconstruction System - Implementation Guide

## Overview

This guide outlines how to build software that retrieves a project repository branch, reconstructs the feature from the point it diverged from main, and creates a new branch with an AI-generated implementation for comparison.

## High-Level Flow

1. Extract feature branch changes (diff analysis)
2. Generate feature ticket/requirements from changes
3. Use existing context generation system to create instructions
4. Have AI implement the feature in a new branch
5. Output: New branch with AI implementation ready for comparison

---

## Step-by-Step Implementation Tasks

### Phase 1: Branch Analysis & Diff Extraction

#### Task 1.1: Create Git Diff Analyzer Module

**File**: `src/diff-analyzer.ts`

Create a module that:

- Finds the merge base (divergence point) between feature branch and base branch
- Extracts all commits on the feature branch since divergence
- Gets the cumulative diff of all changes
- Lists all files added, modified, and deleted

**Dependencies**: `simple-git`

**Output**: Object containing:

```typescript
{
  mergeBase: string,           // commit SHA
  commits: Commit[],           // list of commits
  filesChanged: string[],      // paths of changed files
  diff: string,                // full diff text
  additions: number,           // lines added
  deletions: number            // lines deleted
}
```

---

#### Task 1.2: Create Commit Message Analyzer

**File**: `src/commit-analyzer.ts`

Create a module that:

- Parses commit messages from the feature branch
- Extracts ticket IDs (e.g., "FE-631", "JIRA-123") using regex patterns
- Identifies patterns in commit messages
- Categorizes commits (feature, fix, refactor, test, docs)

**Output**: Object containing:

```typescript
{
  ticketIds: string[],         // extracted ticket references
  commitSummary: string,       // combined summary of changes
  categories: string[],        // types of changes
  commitMessages: string[]     // all commit messages
}
```

---

### Phase 2: Feature Ticket Generation

#### Task 2.1: Create Ticket Generator Using AI

**File**: `src/ticket-generator.ts`

Create a module that:

- Takes diff analysis and commit analysis as input
- Uses Claude SDK to generate a feature ticket
- Formats output as a structured ticket (markdown)

**Prompt Template**:

```
Analyze the following git diff and commit history to create a feature ticket.

Commits:
{commit messages}

Diff:
{diff content}

Generate a ticket with:
- Title
- Description
- Acceptance Criteria
- Technical Notes
- Files Affected
```

**Output**: Markdown file `{tmp}/generated-ticket.md`

---

#### Task 2.2: Create Ticket Validator

**File**: `src/ticket-validator.ts`

Create a module that:

- Validates the generated ticket has required sections
- Checks for completeness (acceptance criteria, description)
- Allows manual editing hook point
- Saves validated ticket to tmp directory

**Output**: Validated ticket file path

---

### Phase 3: Context & Instruction Generation

#### Task 3.1: Enhance Config for Feature Reconstruction

**File**: `src/config.ts` (modify)

Add new config options:

```typescript
type FeatureReconstructionConfig = Config & {
  reconstructionMode: boolean;
  newBranchName?: string; // branch for AI implementation
  ticketSource?: string; // path to ticket file
  skipTicketGeneration?: boolean; // use existing ticket
};
```

Update `loadConfig()` to support these new fields.

---

#### Task 3.2: Integrate with Existing Instruction Generator

**File**: `src/runner.ts` (modify)

Extend `contextGenerationRunner()` to:

- Detect reconstruction mode from config
- Include generated ticket in context
- Use base branch code (not feature branch) for instruction generation
- Pass ticket file path to instruction generator

**Change**: Pass `{tmpPath}/generated-ticket.md` as additional context to `generateInstructions()`

---

### Phase 4: AI Implementation

#### Task 4.1: Create Feature Implementation Module

**File**: `src/feature-implementer.ts`

Create a module that:

- Checks out a new branch from base branch
- Uses Claude Agent SDK to implement the feature
- Provides the generated instructions and ticket as context
- Monitors implementation progress
- Commits changes with descriptive messages

**Prompt Template**:

```
You are implementing a new feature based on the following ticket and instructions.

TICKET:
{ticket content}

INSTRUCTIONS:
{generated instructions from context system}

CODE BASE:
{base branch path}

Please implement this feature following all architectural patterns and style guides provided in the instructions.
Create all necessary files, tests, and documentation.
Commit your changes with clear messages.
```

---

#### Task 4.2: Create Branch Manager

**File**: `src/branch-manager.ts`

Create a module that:

- Creates new branch from base branch: `ai-impl/{ticket-id}`
- Manages git operations during implementation
- Handles commit creation with proper messages
- Pushes branch to remote (optional)

**Operations**:

- `createImplementationBranch(basePath, branchName)`
- `commitChanges(path, message)`
- `pushBranch(path, branchName, remote)`

---

### Phase 5: Orchestration

#### Task 5.1: Create Feature Reconstruction Runner

**File**: `src/reconstruction-runner.ts`

Create main orchestration module that:

1. Loads reconstruction config
2. Checks out base and feature branches
3. Analyzes diffs and commits
4. Generates feature ticket
5. Generates instructions using existing system
6. Creates new implementation branch
7. Runs AI implementation
8. Reports summary

**Error Handling**: Handle each phase failure gracefully with rollback options

---

#### Task 5.2: Update Main Entry Point

**File**: `index.ts` (modify)

Add mode detection:

```typescript
const mode = process.argv[2] || "context-generation";

if (mode === "feature-reconstruction") {
  reconstructionRunner("reconstruction-config.yaml");
} else {
  contextGenerationRunner("issue-to-context.sample.yaml");
}
```

---

#### Task 5.3: Create Sample Reconstruction Config

**File**: `reconstruction-config.sample.yaml`

Create config template:

```yaml
# Feature Reconstruction Config
repo: https://github.com/org/project.git
baseBranch: main
featureBranch: feature/FE-631-some-feature

# Reconstruction settings
reconstructionMode: true
newBranchName: ai-impl/FE-631-reconstruction
skipTicketGeneration: false

# Optional: use existing ticket instead of generating
# ticketSource: ./path/to/ticket.md

# Context (optional)
context:
  - url: https://jira.com/browse/FE-631
    name: Original Ticket
    description: Reference ticket
```

---

### Phase 6: Comparison & Reporting

#### Task 6.1: Create Comparison Report Generator

**File**: `src/comparison-reporter.ts`

Create a module that:

- Compares original feature branch with AI implementation branch
- Generates side-by-side diff report
- Lists differences in approach
- Identifies files only in one implementation
- Creates visual comparison in markdown

**Output**: `{tmp}/comparison-report.md`

---

#### Task 6.2: Create Summary Generator

**File**: `src/summary-generator.ts`

Create a module that:

- Summarizes the entire reconstruction process
- Reports on success/failures
- Lists created branches and their locations
- Provides next steps for manual comparison

**Output**: Console output + `{tmp}/reconstruction-summary.md`

---

### Phase 7: Testing & Refinement

#### Task 7.1: Add Error Handling

Enhance each module with:

- Try-catch blocks around git operations
- Validation of inputs
- Meaningful error messages
- Cleanup on failure (delete incomplete branches)

---

#### Task 7.2: Add Logging

Create `src/logger.ts`:

- Structured logging for each phase
- Progress indicators
- Debug mode support
- Log file output to `{tmp}/reconstruction.log`

---

#### Task 7.3: Add CLI Arguments

Create `src/cli.ts`:

- Parse command line arguments
- Support flags: `--config`, `--mode`, `--verbose`, `--dry-run`
- Display help text
- Validate inputs

---

### Phase 8: Documentation

#### Task 8.1: Update README

Add section explaining:

- Feature reconstruction mode
- How to use it
- Config file format
- Expected outputs

---

#### Task 8.2: Create Examples

Add `examples/` directory with:

- Sample reconstruction configs
- Sample tickets
- Expected output examples

---

## Package.json Script Updates

Add to `scripts`:

```json
{
  "reconstruct": "tsx index.ts feature-reconstruction",
  "start:reconstruct": "npm run reconstruct"
}
```

---

## New Dependencies (if needed)

Consider adding:

- `commander` - CLI argument parsing
- `chalk` - Terminal colors for logging
- `ora` - Loading spinners
- `inquirer` - Interactive prompts (optional)

---

## Directory Structure After Implementation

```
context-generation-mvp/
  src/
    diff-analyzer.ts           [NEW]
    commit-analyzer.ts         [NEW]
    ticket-generator.ts        [NEW]
    ticket-validator.ts        [NEW]
    feature-implementer.ts     [NEW]
    branch-manager.ts          [NEW]
    reconstruction-runner.ts   [NEW]
    comparison-reporter.ts     [NEW]
    summary-generator.ts       [NEW]
    logger.ts                  [NEW]
    cli.ts                     [NEW]
    config.ts                  [MODIFIED]
    runner.ts                  [MODIFIED]
  reconstruction-config.sample.yaml [NEW]
  index.ts                     [MODIFIED]
  repo-tmp/
    base/          (base branch checkout)
    feature/       (original feature branch)
    ai-impl/       [NEW] (AI implementation)
  tmp/
    generated-ticket.md        [NEW]
    instructions.md
    comparison-report.md       [NEW]
    reconstruction-summary.md  [NEW]
    reconstruction.log         [NEW]
```

---

## Success Criteria

The system is complete when:

1. ✅ It can analyze any feature branch and extract changes
2. ✅ It generates a coherent ticket from the changes
3. ✅ It uses existing context generation for instructions
4. ✅ It creates a new branch with AI implementation
5. ✅ Both implementations exist as separate branches for comparison
6. ✅ A comparison report is generated
7. ✅ The process is automated via a single command

---

## Usage Example

```bash
# 1. Create config file
cp reconstruction-config.sample.yaml my-feature.yaml

# 2. Edit config with your repo and branches
vim my-feature.yaml

# 3. Run reconstruction
npm run reconstruct -- --config my-feature.yaml

# 4. Review outputs in tmp/
# 5. Compare branches manually in Git
git diff feature/original ai-impl/FE-631-reconstruction
```

---

## Next Steps After Implementation

1. Test with a real feature branch
2. Iterate on ticket generation prompts
3. Fine-tune AI implementation instructions
4. Add support for multiple ticket formats (Jira, GitHub Issues, etc.)
5. Create web UI for easier comparison (optional)
6. Add metrics collection (implementation time, accuracy, etc.)
