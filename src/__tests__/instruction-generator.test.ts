const mockIterator = async function* () {
  yield { type: "tool_progress", tool_name: "tool1" };
  yield {
    type: "result",
    subtype: "success",
    is_error: false,
    result: "done",
    total_cost_usd: 0,
  };
};

jest.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: jest.fn(() => mockIterator()),
}));

import { generateInstructions } from "../instruction-generator";

describe("generateInstructions", () => {
  test("iterates messages and returns", async () => {
    await generateInstructions("src", "out", "instructions.md", 100, true);
    // no errors thrown
  });
});
