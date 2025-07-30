import type { Config } from 'jest';

const config: Config = {
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },

  /* allow   import … from 'src/…'   inside tests */
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },

  collectCoverageFrom: ['**/*.service.ts', '**/*.controller.ts'],
  setupFilesAfterEnv: ['<rootDir>/../test-setup.ts'],
};

export default config;
