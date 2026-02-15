import { useCallback, useEffect, useState } from 'react';

import { Card } from '@/components/card/card';
import { CATEGORY_COLUMNS, NUMBER_OF_COLUMNS } from '@/constants/categories.mjs';
import { VARIANT_CLASSES } from '@/constants/variant-classes';
import cheatsheetData from '@/data/v6-cheatsheet.json';
import type { TCheatsheetCategoryEntry } from '@/types/cheatsheet';
import type { TTailwindColor } from '@/types/tailwind-color';

const COLOR_VARIANTS: TTailwindColor[] = [
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

function colorVariantByIndex(index: number): string {
	return COLOR_VARIANTS[index % COLOR_VARIANTS.length];
}

function categoryToId(category: string): string {
	return `cat-${category.toLowerCase().replace(/\s+/g, '-')}`;
}

// Tailwind CSS doesn't recognize classes written with template literals
// so we need to use an object to map the number of columns to the corresponding class
const GRID_CLASS: Record<number, string> =
	{
		1: 'md:grid-cols-1',
		2: 'md:grid-cols-2',
		3: 'md:grid-cols-3',
		4: 'md:grid-cols-4',
		5: 'md:grid-cols-5',
		6: 'md:grid-cols-6',
		7: 'md:grid-cols-7',
		8: 'md:grid-cols-8',
		9: 'md:grid-cols-9',
		10: 'md:grid-cols-10',
		11: 'md:grid-cols-11',
		12: 'md:grid-cols-12',
	}[NUMBER_OF_COLUMNS as number] || 'md:grid-cols-3';

/**
 * Builds a stable mapping of each category to its color variant,
 * using the same logic as the column card rendering.
 */
function buildCategoryColorMap(
	categoryEntries: TCheatsheetCategoryEntry[]
): Map<string, TTailwindColor> {
	const map = new Map<string, TTailwindColor>();

	for (let colIndex = 0; colIndex < NUMBER_OF_COLUMNS; colIndex++) {
		const colEntries = categoryEntries.filter(
			([category]) => CATEGORY_COLUMNS[category] === colIndex
		);
		colEntries.forEach(([category], index) => {
			map.set(category, colorVariantByIndex(colIndex + index) as TTailwindColor);
		});
	}

	return map;
}

function scrollToCategory(categoryId: string) {
	const el = document.getElementById(categoryId);
	if (el) {
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
}

function renderCategoryNav(
	categoryEntries: TCheatsheetCategoryEntry[],
	colorMap: Map<string, TTailwindColor>
) {
	return (
		<div className="mb-4 flex flex-wrap justify-center gap-2 px-4">
			{categoryEntries.map(([category]) => {
				const variant = colorMap.get(category) || 'blue';
				const bgClass = VARIANT_CLASSES[variant].bgColor;
				const id = categoryToId(category);

				return (
					<button
						key={category}
						type="button"
						onClick={() => scrollToCategory(id)}
						className={`${bgClass} cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80`}
					>
						{category}
					</button>
				);
			})}
		</div>
	);
}

function renderColumnCards(categoryEntry: TCheatsheetCategoryEntry[], columnIndex: number) {
	return (
		<>
			{categoryEntry.map(([category, categoryItems], index) => (
				<Card
					key={category}
					id={categoryToId(category)}
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
		<div className={`grid grid-cols-1 ${GRID_CLASS} gap-1`}>
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

const SCROLL_THRESHOLD = 200;

function ScrollToTopButton() {
	const [isVisible, setIsVisible] = useState(false);

	const handleScroll = useCallback(() => {
		setIsVisible(window.scrollY > SCROLL_THRESHOLD);
	}, []);

	useEffect(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [handleScroll]);

	if (!isVisible) return null;

	return (
		<button
			type="button"
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			className="fixed right-6 bottom-6 z-50 cursor-pointer rounded-lg bg-gray-700 p-2 text-white shadow-lg transition-opacity hover:bg-gray-600"
			aria-label="Scroll to top"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				className="h-5 w-5"
			>
				<path
					fillRule="evenodd"
					d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
					clipRule="evenodd"
				/>
			</svg>
		</button>
	);
}

export function Cheatsheet() {
	const categoryEntries =
		Array.isArray(cheatsheetData) && cheatsheetData.length > 0
			? (Object.entries(
					Object.groupBy(cheatsheetData, (item) => item.category)
				) as TCheatsheetCategoryEntry[])
			: [];

	const colorMap = buildCategoryColorMap(categoryEntries);

	return (
		<>
			<div className="pt-4 xl:mx-auto xl:max-w-screen-2xl">
				<h1 className="mb-4 text-center text-3xl font-bold text-gray-800 md:text-4xl">
					Pine Script Cheatsheet
				</h1>
				{renderCategoryNav(categoryEntries, colorMap)}
				{renderColumns(categoryEntries)}
			</div>
			<ScrollToTopButton />
		</>
	);
}
