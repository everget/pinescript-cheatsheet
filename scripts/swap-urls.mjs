import fs from 'node:fs';
import path from 'node:path';

const RUNTIME_MODE = {
	DEV: 'dev',
	PROD: 'prod',
};

const MODE = process.argv.includes(`--${RUNTIME_MODE.DEV}`)
	? RUNTIME_MODE.DEV
	: process.argv.includes(`--${RUNTIME_MODE.PROD}`)
		? RUNTIME_MODE.PROD
		: null;

if (!MODE) {
	console.warn('No mode specified. Will toggle between dev and prod.');
}

const isDev = () => MODE === RUNTIME_MODE.DEV;
const isProd = () => MODE === RUNTIME_MODE.PROD;

/* ------------------------ Asset resolving ------------------------ */

const directoryExists = (dirPath) => fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
const getFileNamesFromDirectory = (dirPath) => fs.readdirSync(dirPath);
const makeRegExp = (marker) => new RegExp(`(<!--${marker}-->)([\\s\\S]*?)(<!--${marker}-->)`, 'g');
const buildAssetUrl = (fileName) => (fileName ? `dist/assets/${fileName}` : null);
const makeCssLinkTag = (cssUrl) => (cssUrl ? `<link rel="stylesheet" href="${cssUrl}" />` : '');
const makeJsScriptTag = (jsUrl) => `<script type="module" src="${jsUrl}"></script>`;

function getAssetNames(assetFilenames) {
	return {
		js: assetFilenames.find((f) => f.endsWith('.js')),
		css: assetFilenames.find((f) => f.endsWith('.css')),
	};
}

const CSS_BLOCK_MARKER = 'CSS';
const JS_BLOCK_MARKER = 'JS';

const regularExpressions = {
	[CSS_BLOCK_MARKER]: makeRegExp(CSS_BLOCK_MARKER),
	[JS_BLOCK_MARKER]: makeRegExp(JS_BLOCK_MARKER),
};

const distAssetsPath = path.join(process.cwd(), 'dist', 'assets');
const indexHtmlPath = path.join(process.cwd(), 'index.html');

/* ------------------------ HTML injection ------------------------ */

function injectBlock(html, marker, replacement = '') {
	const regex = regularExpressions[marker];
	if (!regex) {
		console.warn(`Unknown marker: ${marker}`);
		return html;
	}

	return html.replace(regex, replacement ? `$1\n\t\t${replacement}\n\t\t$3` : '$1\n\t\t$3');
}

/* ------------------------ Mode transforms ------------------------ */

function changeToProd(htmlContent, assetNames) {
	const jsUrl = buildAssetUrl(assetNames.js);
	const cssUrl = buildAssetUrl(assetNames.css);

	if (!jsUrl) {
		console.warn('JS asset not found in dist/assets.');
		return htmlContent;
	}

	let html = htmlContent;

	html = injectBlock(html, CSS_BLOCK_MARKER, makeCssLinkTag(cssUrl));
	html = injectBlock(html, JS_BLOCK_MARKER, makeJsScriptTag(jsUrl));

	return html;
}

function changeToDev(htmlContent) {
	let html = htmlContent;

	html = injectBlock(html, CSS_BLOCK_MARKER, '');
	html = injectBlock(html, JS_BLOCK_MARKER, makeJsScriptTag('/src/main.tsx'));

	return html;
}

function updateIndexHtml(htmlContent, assetFiles) {
	const assetNames = getAssetNames(assetFiles);

	if (isProd()) return changeToProd(htmlContent, assetNames);
	if (isDev()) return changeToDev(htmlContent);

	// Toggle mode
	const hasDistAssets = /dist\/assets\//.test(htmlContent);
	return hasDistAssets ? changeToDev(htmlContent) : changeToProd(htmlContent, assetNames);
}

/* ------------------------ Entry point ------------------------ */

function main() {
	if (!directoryExists(distAssetsPath)) {
		console.error('./dist/assets directory not found. Run "vite build" first.');
		return;
	}

	if (!fs.existsSync(indexHtmlPath)) {
		console.error('index.html not found.');
		return;
	}

	const assetFilenames = getFileNamesFromDirectory(distAssetsPath);
	const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

	const updatedHtml = updateIndexHtml(htmlContent, assetFilenames);

	fs.writeFileSync(indexHtmlPath, updatedHtml);
	console.log(`✅ index.html updated for ${MODE || 'toggle'} mode.`);
}

main();
