import { existsSync, mkdirSync, rmSync } from "fs";

export function createDirCleanIfExistsSync(targetPath: string): void {
    if (existsSync(targetPath)) {
        rmSync(targetPath, { recursive: true });
    }
    mkdirSync(targetPath, { recursive: true });
}