import { existsSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { createDirCleanIfExistsSync } from '../clean';

describe('createDirCleanIfExistsSync', () => {
  const target = './src/__tests__/tempdir';

  afterEach(() => {
    try {
      if (existsSync(target)) rmSync(target, { recursive: true });
    } catch (e) {}
  });

  test('creates directory when missing', () => {
    if (existsSync(target)) rmSync(target, { recursive: true });
    createDirCleanIfExistsSync(target);
    expect(existsSync(target)).toBe(true);
  });

  test('cleans directory when exists', () => {
    createDirCleanIfExistsSync(target);
    writeFileSync(`${target}/file.txt`, 'hello');
    expect(readdirSync(target)).toContain('file.txt');
    createDirCleanIfExistsSync(target);
    expect(readdirSync(target)).toHaveLength(0);
  });
});
