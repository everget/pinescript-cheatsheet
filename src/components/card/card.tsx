import type { ICheatsheetEntity } from '@/types/cheatsheet';
import type { TTailwindColor } from '@/types/tailwind-color';

interface CardProps {
	title: string;
	variant: string;
	items: ICheatsheetEntity[];
}

const variantClasses = {
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

export function Card({ title, variant, items }: CardProps) {
	const classes = variantClasses[variant as TTailwindColor] || variantClasses.blue;

	return (
		<div className="overflow-hidden bg-white shadow-lg">
			<div className={`${classes.bgColor} px-4 py-1`}>
				<h2 className="text-xl font-semibold text-white">{title}</h2>
			</div>
			<div className={`divide-y ${classes.divideColor}`}>
				{items.map((item) => (
					<div
						key={title + item.name}
						className={`flex justify-between ${classes.hoverBgColor}`}
					>
						<div className="px-4 text-sm">
							<code className={classes.codeTextColor}>{item.name}</code>
						</div>
						<div className="px-4 text-sm text-black">{item.desc.slice(0, 20)}</div>
					</div>
				))}
			</div>
		</div>
	);
}
