import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.config({
    env: {
      browser: true,
      es2021: true
    },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: [
      '@typescript-eslint',
      'simple-import-sort'
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }),
  {
    files: ['src/**/*.{js,ts}'],
  }
];