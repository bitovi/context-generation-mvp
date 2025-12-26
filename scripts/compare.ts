import { loadEnvFile } from "process";
import { compareRunner } from "../src/compare-runner.js";

loadEnvFile(".env");
compareRunner("./issue-to-context.sample.yaml");
