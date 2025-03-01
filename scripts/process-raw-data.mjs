import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Category } from '../src/data/categories.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawDataPath = join(__dirname, '..', 'src', 'data', 'v6-raw.json');
const cheatsheetDataPath = join(__dirname, '..', 'src', 'data', 'v6-cheatsheet.json');

async function readJsonFile(filePath) {
	const data = await fs.readFile(filePath, 'utf-8');
	return JSON.parse(data);
}

async function writeJsonFile(filePath, data) {
	await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function isFileExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

function startsWith(prefix) {
	return (str) => str.startsWith(prefix);
}

function endsWith(postfix) {
	return (str) => str.endsWith(postfix);
}

function exact(strToMatch) {
	return (str) => str === strToMatch;
}

function includes(substr) {
	return (str) => str.includes(substr);
}

const CategoryConditions = [
	{ category: Category.Alerts, conditions: [startsWith('alert')] },
	{ category: Category.Arrays, conditions: [startsWith('array'), exact('order')] },
	{
		category: Category.BarData,
		conditions: [
			exact('open'),
			exact('high'),
			exact('low'),
			exact('close'),
			exact('bar_index'),
			exact('volume'),
		],
	},
	{ category: Category.BarState, conditions: [startsWith('barstate')] },
	{ category: Category.Boxes, conditions: [startsWith('box')] },
	{ category: Category.ChartTypes, conditions: [startsWith('chart.')] },
	{ category: Category.Colors, conditions: [startsWith('color')] },
	{ category: Category.Currency, conditions: [startsWith('currency')] },
	{
		category: Category.Datetime,
		conditions: [
			exact('time'),
			exact('time_close'),
			exact('time_tradingday'),
			startsWith('timenow'),
			startsWith('second'),
			startsWith('minute'),
			startsWith('hour'),
			startsWith('dayofmonth'),
			startsWith('dayofweek'),
			startsWith('weekofyear'),
			startsWith('month'),
			startsWith('year'),
		],
	},
	{ category: Category.Indicators, conditions: [startsWith('ta')] },
	{ category: Category.Inputs, conditions: [startsWith('input')] },
	{ category: Category.Labels, conditions: [startsWith('label'), startsWith('yloc')] },
	{ category: Category.Lines, conditions: [startsWith('line')] },
	{ category: Category.Polylines, conditions: [startsWith('polyline')] },
	{ category: Category.Maths, conditions: [exact('na'), exact('nz'), startsWith('math')] },
	{ category: Category.Matrixes, conditions: [startsWith('matrix')] },
	{
		category: Category.Plotting,
		conditions: [
			startsWith('plot'),
			startsWith('barcolor'),
			startsWith('bgcolor'),
			startsWith('hline'),
			startsWith('fill'),
			startsWith('shape'),
			startsWith('display'),
		],
	},
	{
		category: Category.Requests,
		conditions: [
			startsWith('adjustment'),
			startsWith('request'),
			startsWith('security'),
			startsWith('financial'),
			startsWith('quandl'),
			startsWith('barmerge'),
			startsWith('earnings'),
			startsWith('dividends'),
			startsWith('splits'),
			startsWith('ticker'),
		],
	},
	{ category: Category.Sessions, conditions: [startsWith('session')] },
	{ category: Category.Strategy, conditions: [startsWith('strategy')] },
	{ category: Category.Strings, conditions: [startsWith('str')] },
	{ category: Category.Syminfo, conditions: [startsWith('syminfo')] },
	{ category: Category.Timeframe, conditions: [startsWith('timeframe')] },
];

function handleDescription(desc) {
	return trimTrailingPoint(Array.isArray(desc) ? desc[0] : (desc ?? ''))
		.trim()
		.slice(0, 40);
}

function trimTrailingPoint(str) {
	return str.replace(/\.$/, '');
}

function mapCollection(collection) {
	return collection.map((item) => ({
		name: item.name,
		desc: handleDescription(item.desc),
	}));
}

function putItemsIntoCategory(categoryAcc, collection) {
	for (const item of collection) {
		if (!categoryAcc.find((existingItem) => existingItem.name === item.name)) {
			categoryAcc.push({
				name: item.name,
				desc: item.desc,
			});
		}
	}
}

function putItemIntoCategoryByCondition(acc, name, description) {
	for (const { category, conditions } of CategoryConditions) {
		if (
			conditions.some((condition) => condition(name)) &&
			!acc[category].find((item) => item.name === name)
		) {
			acc[category].push({
				name: name,
				desc: description,
			});
			break;
		}
	}
}

function putVariableIntoCategoryByCondition(acc, name, description) {
	putItemIntoCategoryByCondition(acc, name, trimTrailingPoint(handleDescription(description)));
}

function putFunctionIntoCategoryByCondition(acc, name, description) {
	putItemIntoCategoryByCondition(
		acc,
		`${name}()`,
		trimTrailingPoint(handleDescription(description))
	);
}

async function processRawData() {
	const rawData = await readJsonFile(rawDataPath);

	const initialAccumulator = Object.keys(Category).reduce((acc, key) => {
		acc[Category[key]] = [];
		return acc;
	}, {});

	const cheatsheetData = Object.entries(rawData).reduce((acc, [rawTitle, rawCollection]) => {
		const title = rawTitle.trim().toLowerCase();

		if (title === 'annotations') {
			putItemsIntoCategory(acc[Category.Annotations], mapCollection(rawCollection));
		} else if (title === 'keywords') {
			putItemsIntoCategory(acc[Category.Keywords], mapCollection(rawCollection));
		} else if (title === 'operators') {
			putItemsIntoCategory(acc[Category.Operators], mapCollection(rawCollection));
		} else if (title === 'types') {
			putItemsIntoCategory(acc[Category.Types], mapCollection(rawCollection));
		} else if (title === 'functions') {
			for (const obj of rawCollection) {
				putFunctionIntoCategoryByCondition(acc, obj.name, obj.desc ?? '');
			}
		} else if (title === 'variables' || title === 'constants') {
			for (const obj of rawCollection) {
				putVariableIntoCategoryByCondition(acc, obj.name, obj.desc ?? '');
			}
		} else if (title === 'methods') {
			for (const obj of rawCollection) {
				putFunctionIntoCategoryByCondition(
					acc,
					obj.originalName ?? obj.name,
					obj.desc ?? ''
				);
			}
		}

		return acc;
	}, initialAccumulator);

	for (const category of Object.keys(cheatsheetData)) {
		cheatsheetData[category].sort((a, b) => a.name.localeCompare(b.name));
	}

	const cheatsheetFlatData = Object.entries(cheatsheetData).reduce((acc, [category, items]) => {
		acc.push(...items.map((item) => ({ ...item, category })));
		return acc;
	}, []);

	if (await isFileExists(cheatsheetDataPath)) {
		const existingFlatData = await readJsonFile(cheatsheetDataPath);
		const newFlatItems = cheatsheetFlatData.filter(
			(newItem) =>
				!existingFlatData.find(
					(item) => item.category === newItem.category && item.name === newItem.name
				)
		);

		await writeJsonFile(cheatsheetDataPath, [...existingFlatData, ...newFlatItems]);
	} else {
		await writeJsonFile(cheatsheetDataPath, cheatsheetFlatData);
	}

	console.log('Cheatsheet data has been written to', cheatsheetDataPath);
}

processRawData().catch(console.error);
