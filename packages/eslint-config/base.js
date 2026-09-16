import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export const baseConfig = tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dist-storybook/**',
      '**/dist-docs/**',
      '**/Docs/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/node_modules/**',
      '.output.txt',
      '**/.pnpm-store/**',
      'pnpm-lock.yaml',
      'AGENTS.md',
      '**/AGENTS.md',
      'agents.md',
      '**/agents.md',
      'README.md',
      '**/README.md',
      'readme.md',
      '**/readme.md',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never',
        },
      ],
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettierConfig,
);

export default baseConfig;
