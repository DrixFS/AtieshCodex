import tseslint from 'typescript-eslint';
import baseConfig from './packages/eslint-config/base.js';
import reactConfig from './packages/eslint-config/react.js';
import nodeConfig from './packages/eslint-config/node.js';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['apps/client/**/*.{ts,tsx}'],
    ...reactConfig[reactConfig.length - 1],
  },
  {
    files: ['apps/server/**/*.{ts,js}'],
    ...nodeConfig[nodeConfig.length - 1],
  },
);
