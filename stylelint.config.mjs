/** @type {import('stylelint').Config} */
export default {
	extends: [
		'stylelint-config-standard',
		'stylelint-config-idiomatic-order',
	],
	plugins: [
		'stylelint-prettier',
	],
	reportDescriptionlessDisables: true,
	reportInvalidScopeDisables: true,
	reportNeedlessDisables: true,
	reportUnscopedDisables: true,
	rules: {
		'import-notation': null,
		'prettier/prettier': true,
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: [
					'apply',
					'config',
					'layer',
					'tailwind',
				],
			},
		],
		'block-no-empty': true,
		'color-named': null,
		'declaration-no-important': true,
		'no-unknown-animations': true,
	},
};
