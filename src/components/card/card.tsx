import { useCallback, useEffect, useRef, useState } from 'react';

import type { ICheatsheetEntity } from '@/types/cheatsheet';
import type { TTailwindColor } from '@/types/tailwind-color';

interface CardProps {
	id?: string;
	title: string;
	variant: string;
	items: ICheatsheetEntity[];
}

export const VARIANT_CLASSES: Record<TTailwindColor, { [key: string]: string }> = {
	blue: {
		bgColor: 'bg-blue-500',
		textColor: 'text-blue-700',
		rowBgColor: 'bg-blue-50',
		hoverBgColor: 'hover:bg-blue-50',
		codeTextColor: 'text-blue-600',
		divideColor: 'divide-blue-100',
	},
	purple: {
		bgColor: 'bg-purple-500',
		textColor: 'text-purple-700',
		rowBgColor: 'bg-purple-50',
		hoverBgColor: 'hover:bg-purple-50',
		codeTextColor: 'text-purple-600',
		divideColor: 'divide-purple-100',
	},
	green: {
		bgColor: 'bg-green-500',
		textColor: 'text-green-700',
		rowBgColor: 'bg-green-50',
		hoverBgColor: 'hover:bg-green-50',
		codeTextColor: 'text-green-600',
		divideColor: 'divide-green-100',
	},
	red: {
		bgColor: 'bg-red-500',
		textColor: 'text-red-700',
		rowBgColor: 'bg-red-50',
		hoverBgColor: 'hover:bg-red-50',
		codeTextColor: 'text-red-600',
		divideColor: 'divide-red-100',
	},
	yellow: {
		bgColor: 'bg-yellow-500',
		textColor: 'text-yellow-700',
		rowBgColor: 'bg-yellow-50',
		hoverBgColor: 'hover:bg-yellow-50',
		codeTextColor: 'text-yellow-600',
		divideColor: 'divide-yellow-100',
	},
	indigo: {
		bgColor: 'bg-indigo-500',
		textColor: 'text-indigo-700',
		rowBgColor: 'bg-indigo-50',
		hoverBgColor: 'hover:bg-indigo-50',
		codeTextColor: 'text-indigo-600',
		divideColor: 'divide-indigo-100',
	},
	pink: {
		bgColor: 'bg-pink-500',
		textColor: 'text-pink-700',
		rowBgColor: 'bg-pink-50',
		hoverBgColor: 'hover:bg-pink-50',
		codeTextColor: 'text-pink-600',
		divideColor: 'divide-pink-100',
	},
	teal: {
		bgColor: 'bg-teal-500',
		textColor: 'text-teal-700',
		rowBgColor: 'bg-teal-50',
		hoverBgColor: 'hover:bg-teal-50',
		codeTextColor: 'text-teal-600',
		divideColor: 'divide-teal-100',
	},
	orange: {
		bgColor: 'bg-orange-500',
		textColor: 'text-orange-700',
		rowBgColor: 'bg-orange-50',
		hoverBgColor: 'hover:bg-orange-50',
		codeTextColor: 'text-orange-600',
		divideColor: 'divide-orange-100',
	},
};

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
		>
			<path
				fillRule="evenodd"
				d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

interface CardItemProps {
	item: ICheatsheetEntity;
	isExpanded: boolean;
	onToggle: () => void;
	hoverBgColor: string;
	codeTextColor: string;
}

function CardItem({ item, isExpanded, onToggle, hoverBgColor, codeTextColor }: CardItemProps) {
	const textRef = useRef<HTMLSpanElement>(null);
	const [isOverflowing, setIsOverflowing] = useState(false);

	const checkOverflow = useCallback(() => {
		const el = textRef.current;
		if (el) {
			setIsOverflowing(el.scrollWidth > el.clientWidth);
		}
	}, []);

	useEffect(() => {
		const el = textRef.current;
		if (!el) return;

		checkOverflow();

		const observer = new ResizeObserver(checkOverflow);
		observer.observe(el);
		return () => observer.disconnect();
	}, [checkOverflow]);

	return (
		<div className={`flex items-center ${hoverBgColor}`}>
			<div className="shrink-0 pl-4 text-sm">
				<code className={codeTextColor}>{item.name}</code>
			</div>
			<div
				className={`flex min-w-0 gap-1 pl-2 text-sm text-black ${isOverflowing || isExpanded ? 'cursor-pointer' : ''}`}
				onClick={isOverflowing || isExpanded ? onToggle : undefined}
			>
				<span ref={textRef} className={isExpanded ? 'whitespace-normal' : 'truncate'}>
					{item.desc}
				</span>
				{(isOverflowing || isExpanded) && (
					<button
						type="button"
						className="ml-1 flex-shrink-0 cursor-pointer rounded p-0.5 text-gray-400 transition-colors hover:text-gray-700"
						aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
					>
						<ChevronIcon isExpanded={isExpanded} />
					</button>
				)}
			</div>
		</div>
	);
}

export function Card({ id, title, variant, items }: CardProps) {
	const classes = VARIANT_CLASSES[variant as TTailwindColor] || VARIANT_CLASSES.blue;
	const [expandedKey, setExpandedKey] = useState<string | null>(null);

	const toggleExpand = (key: string) => {
		setExpandedKey((prev) => (prev === key ? null : key));
	};

	return (
		<div id={id} className="overflow-hidden bg-white shadow-lg">
			<div className={`${classes.bgColor} px-4 py-1`}>
				<h2 className="text-xl font-semibold text-white">{title}</h2>
			</div>
			<div className={`divide-y ${classes.divideColor}`}>
				{items.map((item) => {
					const key = title + item.name;
					return (
						<CardItem
							key={key}
							item={item}
							isExpanded={expandedKey === key}
							onToggle={() => toggleExpand(key)}
							hoverBgColor={classes.hoverBgColor}
							codeTextColor={classes.codeTextColor}
						/>
					);
				})}
			</div>
		</div>
	);
}
