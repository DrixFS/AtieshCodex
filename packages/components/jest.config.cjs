module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.test\\.(ts|js)$',
  testPathIgnorePatterns: ['\\.visual\\.test\\.(ts|js)$'],
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            dynamicImport: true,
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
