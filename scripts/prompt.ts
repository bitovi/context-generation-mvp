import { loadEnvFile } from "process";
import { promptRunner } from "../src/prompt-runner.js";

loadEnvFile(".env");
promptRunner("issue-to-context.sample.yaml");
