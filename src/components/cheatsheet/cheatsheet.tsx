import { Card } from '@/components/card/card';
import { CATEGORY_COLUMNS, NUMBER_OF_COLUMNS } from '@/data/categories.mjs';
import cheatsheetData from '@/data/v6-cheatsheet.json';
import type { TCheatsheetCategoryEntry } from '@/types/cheatsheet';
import type { TTailwindColor } from '@/types/tailwind-color';

function colorVariantByIndex(index: number): string {
	const variants: TTailwindColor[] = [
		'blue',
		'purple',
		'green',
		'red',
		'yellow',
		'indigo',
		'pink',
		'teal',
		'orange',
	];
	return variants[index % variants.length];
}

// Tailwind CSS doesn't recognize classes written with template literals
// so we need to use an object to map the number of columns to the corresponding class
const gridClass =
	{
		1: 'grid-cols-1',
		2: 'grid-cols-2',
		3: 'grid-cols-3',
		4: 'grid-cols-4',
		5: 'grid-cols-5',
		6: 'grid-cols-6',
		7: 'grid-cols-7',
		8: 'grid-cols-8',
		9: 'grid-cols-9',
		10: 'grid-cols-10',
		11: 'grid-cols-11',
		12: 'grid-cols-12',
	}[NUMBER_OF_COLUMNS] || 'grid-cols-3';

function renderColumnCards(categoryEntry: TCheatsheetCategoryEntry[], columnIndex: number) {
	return (
		<>
			{categoryEntry.map(([category, categoryItems], index) => (
				<Card
					key={category}
					title={category}
					variant={colorVariantByIndex(columnIndex + index)}
					items={categoryItems}
				/>
			))}
		</>
	);
}

function renderColumns(categoryEntries: TCheatsheetCategoryEntry[]) {
	return (
		<div className={`grid ${gridClass} gap-1`}>
			{Array.from({ length: NUMBER_OF_COLUMNS }).map((_, index) => (
				<div className="flex flex-col" key={index}>
					{renderColumnCards(
						categoryEntries.filter(
							([category]) => CATEGORY_COLUMNS[category] === index
						),
						index
					)}
				</div>
			))}
		</div>
	);
}

export function Cheatsheet() {
	const categoryEntries =
		Array.isArray(cheatsheetData) && cheatsheetData.length > 0
			? (Object.entries(
					Object.groupBy(cheatsheetData, (item) => item.category)
				) as TCheatsheetCategoryEntry[])
			: [];
	return (
		<div className="pt-4 xl:mx-auto xl:max-w-screen-2xl">
			<h1 className="mb-4 text-center text-4xl font-bold text-gray-800">
				Pine Script Cheatsheet
			</h1>
			{renderColumns(categoryEntries)}
		</div>
	);
}
