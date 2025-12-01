import { loadEnvFile } from "process";
import { contextGenerationRunner } from "./src/runner.js";
loadEnvFile('.env');
contextGenerationRunner('issue-to-context.sample.yaml');