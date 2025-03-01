import path from 'node:path';
import { quote } from 'shell-quote';
const IS_WINDOWS = process.platform === 'win32';

function escape(str) {
	const escaped = quote(str);
	return escaped.replace(/\\@/g, '@');
}

function getRelativePaths(filenames) {
	return filenames
		.map((f) => path.relative(process.cwd(), f))
		.join(' ');
}

function escapeFileNames(filenames) {
	return filenames
		.map((f) => (IS_WINDOWS ? f : escape([f])))
		.join(' ');
}

function gitAdd(filenames) {
	return `git add ${escapeFileNames(filenames)}`;
}

function addCommands(stagedFiles, commands) {
	return [
		...commands,
		gitAdd(stagedFiles),
	];
}

export default {
	'*.{,m,c}{j,t}s{,x}': (stagedFiles) => {
		return [
			'pnpm types:check',
			'pnpm lint:js',
			gitAdd(stagedFiles),
		];
	},
	'*.{css,scss,sass,less,styl}': (stagedFiles) => {
		return [
			'pnpm lint:styles',
			gitAdd(stagedFiles),
		];
	},
	'*.vue': (stagedFiles) => {
		return [
			gitAdd(stagedFiles),
		];
	},
	'*.astro': (stagedFiles) => {
		return [
			gitAdd(stagedFiles),
		];
	},
	'*.{html,svg}': (stagedFiles) => {
		return [
			gitAdd(stagedFiles),
		];
	},
	'*.{json,yml,yaml}': (stagedFiles) => {
		return [
			gitAdd(stagedFiles),
		];
	},
	'*.{md,mdx}': (stagedFiles) => {
		return [
			gitAdd(stagedFiles),
		];
	},
};
