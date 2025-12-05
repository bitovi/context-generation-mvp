import { writeFileSync, rmSync, existsSync } from 'fs';
import { loadConfig } from '../config';

describe('loadConfig', () => {
  const goodPath = './src/__tests__/temp-config.yaml';
  const badPath = './src/__tests__/bad-config.yaml';

  afterEach(() => {
    try {
      if (existsSync(goodPath)) rmSync(goodPath);
      if (existsSync(badPath)) rmSync(badPath);
    } catch (e) {
      // ignore cleanup errors
    }
  });

  test('loads a valid YAML config', () => {
    const yaml = `repo: my/repo\nfeatureBranch: feat\nbaseBranch: main\ninstructionFileName: instr.md\n`;
    writeFileSync(goodPath, yaml);
    const cfg = loadConfig(goodPath);
    expect(cfg.repo).toBe('my/repo');
    expect(cfg.featureBranch).toBe('feat');
    expect(cfg.instructionFileName).toBe('instr.md');
  });

  test('throws when required fields missing', () => {
    const yaml = `baseBranch: main\n`;
    writeFileSync(badPath, yaml);
    expect(() => loadConfig(badPath)).toThrow(/Invalid config file/);
  });
});
