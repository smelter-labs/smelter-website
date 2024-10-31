import globals from 'globals';

import eslintRecommended from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tsEslintPlugin from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import tsParser from '@typescript-eslint/parser';

export default [
  eslintRecommended.configs.recommended,
  ...tsEslintPlugin.configs.recommended,
  pluginPrettierRecommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['.prettierrc.js'],
    // plugins: {
    //   '@typescript-eslint': tsEslintPlugin,
    // },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'prettier/prettier': ['error'],
      '@typescript-eslint/no-explicit-any': [0, {}],
      '@typescript-eslint/no-floating-promises': ['error'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'local',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    ignores: ['**/dist/**/*', '**/generated/**/*', '**/*.d.ts', '**/*.config.mjs'],
  },
];
