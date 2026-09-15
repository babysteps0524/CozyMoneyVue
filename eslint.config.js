import js from '@eslint/js'
import vueParser from 'vue-eslint-parser'
import eslintPluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.git/**', '.github/**', 'coverage/**', '.wrangler/**'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...eslintPluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue'],

    languageOptions: {
      parser: vueParser,

      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },

      globals: {
        window: 'readonly',
        document: 'readonly',
        location: 'readonly',
        history: 'readonly',
        console: 'readonly',
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'no-console': 'off',

      // Vue 템플릿 형식
      'vue/max-attributes-per-line': 'off',
      'vue/attributes-order': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/mustache-interpolation-spacing': 'off',
      'vue/valid-attribute-name': 'off',

      // Prettier와 충돌하는 Vue 포맷 규칙
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/first-attribute-linebreak': 'off',

      // Prettier의 <img /> self-closing 허용
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },

  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tseslint.parser,

      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },

      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'no-console': 'off',
    },
  },
]
