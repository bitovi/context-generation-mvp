jest.mock("../clean", () => ({ createDirCleanIfExistsSync: jest.fn() }));
jest.mock("../code-checkout", () => ({ checkoutRepo: jest.fn() }));
jest.mock("../config", () => ({ loadConfig: jest.fn() }));
jest.mock("../instruction-generator", () => ({
  generateInstructions: jest.fn(),
}));

import { contextGenerationRunner } from "../context-runner";
import { loadConfig } from "../config";
import { checkoutRepo } from "../code-checkout";
import { generateInstructions } from "../instruction-generator";

describe("contextGenerationRunner", () => {
  beforeEach(() => {
    (loadConfig as jest.Mock).mockReturnValue({
      repo: "r",
      featureBranch: "f",
      baseBranch: "b",
    });
    (checkoutRepo as jest.Mock).mockResolvedValue(undefined);
    (generateInstructions as jest.Mock).mockResolvedValue(undefined);
  });

  test("runs checkout and generateInstructions", async () => {
    await contextGenerationRunner("./some-config.yaml");
    expect(loadConfig).toHaveBeenCalledWith("./some-config.yaml");
    expect(checkoutRepo).toHaveBeenCalledTimes(1);
    expect(generateInstructions).toHaveBeenCalled();
  });
});
