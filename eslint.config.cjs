const js = require('@eslint/js')
const globals = require('globals')
const tseslint = require('typescript-eslint')

const sharedGlobals = {
  ...globals.browser,
  ...globals.node,
}

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      // build outputs are emitted next to sources by tsc
      '**/*.d.ts',
      '**/*.js',
      '**/*.js.map',
    ],
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      sourceType: 'commonjs',
      globals: sharedGlobals,
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ...config.languageOptions,
      globals: sharedGlobals,
    },
  })),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]
