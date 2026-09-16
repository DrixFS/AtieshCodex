module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.test\\.(ts|tsx)$',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            dynamicImport: true,
            importMeta: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
            optimizer: {
              globals: {
                vars: {
                  'import.meta.env': 'process.env',
                },
              },
            },
          },
        },
      },
    ],
  },
  setupFiles: ['<rootDir>/src/test/polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/styleMock.cjs',
    '^@atiesh/contracts$': '<rootDir>/../../packages/contracts/src/index.ts',
    '^@atiesh/components$': '<rootDir>/../../packages/components/src/index.ts',
  },
};
