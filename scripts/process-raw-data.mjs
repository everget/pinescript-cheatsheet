import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Category } from '../src/constants/categories.mjs';

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

const startsWith = (prefix) => (str) => str.startsWith(prefix);
const endsWith = (postfix) => (str) => str.endsWith(postfix);
const exact = (strToMatch) => (str) => str === strToMatch;
const includes = (substr) => (str) => str.includes(substr);

const CATEGORY_RULES = [
	{ category: Category.Alerts, matchers: [startsWith('alert')] },
	{ category: Category.Arrays, matchers: [startsWith('array'), startsWith('order.')] },
	{
		category: Category.BarData,
		matchers: [
			exact('open'),
			exact('high'),
			exact('low'),
			exact('close'),
			exact('bar_index'),
			exact('volume'),
			exact('time'),
			exact('hl2'),
			exact('hlc3'),
			exact('hlcc4'),
			exact('ohlc4'),
			exact('last_bar_index'),
			exact('last_bar_time'),
			exact('timestamp'),
		],
	},
	{ category: Category.BarState, matchers: [startsWith('barstate')] },
	{ category: Category.Boxes, matchers: [startsWith('box')] },
	{ category: Category.ChartTypesPoints, matchers: [startsWith('chart.')] },
	{ category: Category.Colors, matchers: [startsWith('color')] },
	{ category: Category.Currency, matchers: [startsWith('currency')] },
	{
		category: Category.Datetime,
		matchers: [
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
	{ category: Category.Indicators, matchers: [startsWith('ta.')] },
	{ category: Category.Inputs, matchers: [startsWith('input')] },
	{ category: Category.Labels, matchers: [startsWith('label'), startsWith('yloc')] },
	{ category: Category.Lines, matchers: [startsWith('line')] },
	{ category: Category.Polylines, matchers: [startsWith('polyline')] },
	{
		category: Category.Maths,
		matchers: [exact('na'), exact('nz'), exact('fixnan'), startsWith('math')],
	},
	{ category: Category.Matrixes, matchers: [startsWith('matrix')] },
	{
		category: Category.Plotting,
		matchers: [
			startsWith('plot'),
			startsWith('barcolor'),
			startsWith('bgcolor'),
			startsWith('hline'),
			startsWith('fill'),
			startsWith('shape'),
			startsWith('display'),
			startsWith('location'),
			startsWith('size'),
		],
	},
	{
		category: Category.Requests,
		matchers: [
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
	{ category: Category.Sessions, matchers: [startsWith('session')] },
	{ category: Category.Strategy, matchers: [startsWith('strategy')] },
	{ category: Category.Strings, matchers: [startsWith('str')] },
	{ category: Category.Syminfo, matchers: [startsWith('syminfo')] },
	{ category: Category.Tables, matchers: [startsWith('table'), startsWith('position')] },
	{ category: Category.Maps, matchers: [startsWith('map')] },
	{
		category: Category.PositionsLocations,
		matchers: [startsWith('location.'), startsWith('xloc.'), startsWith('yloc.')],
	},
	{
		category: Category.StylingLayout,
		matchers: [startsWith('extend.'), startsWith('scale.'), startsWith('size.')],
	},
	{
		category: Category.ScriptType,
		matchers: [exact('indicator'), exact('strategy'), exact('library')],
	},
	{
		category: Category.LoggingDebugging,
		matchers: [startsWith('log.'), exact('runtime.')],
	},
	{
		category: Category.TextsFormatting,
		matchers: [startsWith('font.'), startsWith('format.'), startsWith('text.')],
	},
	{ category: Category.Timeframe, matchers: [startsWith('timeframe')] },
];

// TODO: Fix hardcoded length
function handleDescription(desc) {
	return trimTrailingPoint(Array.isArray(desc) ? desc[0] : (desc ?? '')).trim();
	// .slice(0, 40);
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
	for (const { category, matchers } of CATEGORY_RULES) {
		if (
			matchers.some((matcher) => matcher(name)) &&
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

const ReferenceCollectionTitle = {
	Annotations: 'annotations',
	Keywords: 'keywords',
	Operators: 'operators',
	Types: 'types',
	Functions: 'functions',
	Variables: 'variables',
	Constants: 'constants',
	Methods: 'methods',
};

async function processRawData() {
	const rawData = await readJsonFile(rawDataPath);

	const initialAccumulator = Object.keys(Category).reduce((acc, key) => {
		acc[Category[key]] = [];
		return acc;
	}, {});

	const cheatsheetData = Object.entries(rawData).reduce((acc, [rawTitle, rawCollection]) => {
		const title = rawTitle.trim().toLowerCase();

		if (title === ReferenceCollectionTitle.Annotations) {
			putItemsIntoCategory(acc[Category.Annotations], mapCollection(rawCollection));
		} else if (title === ReferenceCollectionTitle.Keywords) {
			putItemsIntoCategory(acc[Category.Keywords], mapCollection(rawCollection));
		} else if (title === ReferenceCollectionTitle.Operators) {
			putItemsIntoCategory(acc[Category.Operators], mapCollection(rawCollection));
		} else if (title === ReferenceCollectionTitle.Types) {
			putItemsIntoCategory(acc[Category.Types], mapCollection(rawCollection));
		} else if (title === ReferenceCollectionTitle.Functions) {
			for (const obj of rawCollection) {
				putFunctionIntoCategoryByCondition(acc, obj.name, obj.desc ?? '');
			}
		} else if (
			title === ReferenceCollectionTitle.Variables ||
			title === ReferenceCollectionTitle.Constants
		) {
			for (const obj of rawCollection) {
				putVariableIntoCategoryByCondition(acc, obj.name, obj.desc ?? '');
			}
		} else if (title === ReferenceCollectionTitle.Methods) {
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
