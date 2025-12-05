/**
 * CommonJS Jest config generated from jest.config.ts to avoid needing ts-node in CI.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: {
        module: 'CommonJS',
      },
    },
  },
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
