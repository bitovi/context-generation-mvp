import { loadEnvFile } from "process";
import { contextGenerationRunner } from "../src/context-runner.js";

loadEnvFile(".env");
contextGenerationRunner("issue-to-context.sample.yaml");
