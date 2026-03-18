import { defineConfig, globalIgnores } from 'eslint/config'
import { readFileSync } from 'node:fs'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const prettierConfig = JSON.parse(readFileSync(new URL('./.prettierrc', import.meta.url), 'utf8'))

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.agent/*'
  ]),
  // Keep this last so it turns off formatting rules that conflict with Prettier.
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': ['error', prettierConfig]
    }
  }
])

export default eslintConfig
