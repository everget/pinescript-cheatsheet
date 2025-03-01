import globals from 'globals';
import jsPlugin from '@eslint/js';
import tsPlugin from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

/** @type {import('eslint').Linter.Config[]} */
export default tsPlugin.config(
	{
		ignores: [
			'dist',
		],
	},
	{
		extends: [
			jsPlugin.configs.recommended,
			...tsPlugin.configs.recommended,
		],
		files: [
			'**/*.{ts,tsx}',
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooksPlugin,
			'react-refresh': reactRefreshPlugin,
		},
		rules: {
			...reactHooksPlugin.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{
					allowConstantExport: true,
				},
			],
		},
	},
)
