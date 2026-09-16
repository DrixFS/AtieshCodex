import tseslint from 'typescript-eslint';
import globals from 'globals';
import baseConfig from './base.js';

export const nodeConfig = tseslint.config(...baseConfig, {
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
});

export default nodeConfig;
