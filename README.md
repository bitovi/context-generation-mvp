# context-generation-mvp

## workflow

#1 Checkout repository
inputs: repository URL, merge commit (which represents a PR for a feature)
Tool checks out repository on a specific subfolder

#2 Generate instructions.md file
inputs: best practices documents, standards etc
Agent looks at subfolder and generates instructions file 

#3 Checkout repository before merge commit
inputs: repository URL, merge commit
Tool checks out repository on commit right before merge commit and checks out to a new branch

#4 Reimplement feature
inputs: Jira ticket, Figma designs
Agent looks at subfolder and tries to reimplemement feature and then calls Tool for #5

#5 Create PR
inputs: commit message
Tool commits files and creates a new PR
