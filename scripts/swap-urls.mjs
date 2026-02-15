import fs from 'node:fs';
import path from 'node:path';

const MODE = process.argv.includes('--dev')
	? 'dev'
	: process.argv.includes('--prod')
		? 'prod'
		: null;

const isDev = () => MODE === 'dev';
const isProd = () => MODE === 'prod';

if (!MODE) {
	console.warn('No mode specified. Will toggle between dev and prod.');
}

const distAssetPattern = /="dist\/assets\/[\w\d-]+\./;
const distCssPattern = /<link\s+rel="stylesheet"\s+href="dist\/assets\/[\w\d-]+\.css"\s*\/?>/;

function directoryExists(dirPath) {
	return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function getFileNamesFromDirectory(dirPath) {
	return fs.readdirSync(dirPath);
}

function getAssetPaths(assetFiles) {
	const jsPath = assetFiles.find((file) => /\.jsx?$/.test(file));
	const cssPath = assetFiles.find((file) => file.endsWith('.css'));
	const paths = {};

	if (jsPath) {
		paths.js = jsPath;
	}

	if (cssPath) {
		paths.css = cssPath;
	}

	return paths;
}

function changeToProd(htmlContent, assetPaths) {
	if (!distCssPattern.test(htmlContent)) {
		htmlContent = htmlContent.replace(
			/<\/title>/,
			`</title><link rel="stylesheet" href="dist/assets/${assetPaths.css}" />`
		);
	}

	return htmlContent.replace(/\/src\/main\.tsx?/g, `dist/assets/${assetPaths.js}`);
}

function changeToDev(htmlContent) {
	return htmlContent
		.replace(/dist\/assets\/[\w\d-]+\.jsx?/g, '/src/main.tsx')
		.replace(distCssPattern, '');
}

function updateIndexHtml(htmlContent, assetFiles) {
	const assetPaths = getAssetPaths(assetFiles);

	if (isProd()) {
		return changeToProd(htmlContent, assetPaths);
	} else if (isDev()) {
		return changeToDev(htmlContent);
	} else {
		if (distAssetPattern.test(htmlContent)) {
			return changeToDev(htmlContent);
		}
		return changeToProd(htmlContent, assetPaths);
	}
}

function main() {
	const distAssetsPath = path.join(process.cwd(), 'dist', 'assets');
	const indexHtmlPath = path.join(process.cwd(), 'index.html');

	if (directoryExists(distAssetsPath)) {
		const assetFiles = getFileNamesFromDirectory(distAssetsPath);

		if (fs.existsSync(indexHtmlPath)) {
			let htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
			htmlContent = updateIndexHtml(htmlContent, assetFiles);
			fs.writeFileSync(indexHtmlPath, htmlContent);
			console.log('index.html has been updated with asset references.');
		} else {
			console.error('index.html not found.');
		}
	} else {
		console.error('./dist/assets directory not found.');
	}
}

main();
