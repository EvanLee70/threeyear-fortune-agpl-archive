import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // vendor: 외부 이식 코드(fortuneteller 등)는 원본 스타일 유지 — 린트 제외
  globalIgnores(['dist', 'src/vendor']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // React Compiler 시대의 신형 규칙 — 기존 fetch→setState 패턴 전반에 걸리므로 경고로 완화
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // 업스트림 orrery 코어(천문 계산·계수 테이블) — 원본 스타일 존중, 스타일 규칙 완화
    files: ['packages/core/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'no-loss-of-precision': 'off', // 천문 계수 테이블의 고정밀 리터럴
    },
  },
])
