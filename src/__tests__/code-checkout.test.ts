import { simpleGit } from 'simple-git';
import * as path from 'path';

jest.mock('../clean', () => ({ createDirCleanIfExistsSync: jest.fn() }));

const mockClone = jest.fn().mockResolvedValue(undefined);
const mockFetch = jest.fn().mockResolvedValue(undefined);
const mockCheckout = jest.fn().mockResolvedValue(undefined);

jest.mock('simple-git', () => ({
  simpleGit: jest.fn(() => ({
    clone: mockClone,
    fetch: mockFetch,
    checkout: mockCheckout,
  })),
}));

import { checkoutRepo } from '../code-checkout';

describe('checkoutRepo', () => {
  beforeEach(() => {
    mockClone.mockClear();
    mockFetch.mockClear();
    mockCheckout.mockClear();
    (simpleGit as jest.Mock).mockClear();
  });

  test('calls git clone, fetch and checkout', async () => {
    const target = './tmp-checkout';
    const repoUrl = 'https://github.com/example/repo.git';
    const branch = 'feature-branch';

    await checkoutRepo(target, repoUrl, branch);

    // first simpleGit called with target
    expect((simpleGit as jest.Mock).mock.calls[0][0]).toBe(target);
    expect(mockClone).toHaveBeenCalled();

    // second simpleGit called with joined path containing repo name
    const secondCall = (simpleGit as jest.Mock).mock.calls[1][0];
    expect(secondCall).toEqual(path.join(target, 'repo'));

    expect(mockFetch).toHaveBeenCalled();
    expect(mockCheckout).toHaveBeenCalledWith(branch);
  });
});
