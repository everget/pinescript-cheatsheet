export interface ICheatsheetEntity {
	name: string;
	desc: string;
}

export type TCheatsheetData = Record<string, ICheatsheetEntity[]>;
export type TCheatsheetCategoryEntry = [string, ICheatsheetEntity[]];

export type TCheatsheetCategory =
	| 'Types'
	| 'Annotations'
	| 'Keywords'
	| 'Operators'
	| 'Bar Data'
	| 'Colors'
	| 'Plotting'
	| 'Alerts'
	| 'Arrays'
	| 'Bar State'
	| 'Boxes'
	| 'Chart Types'
	| 'Currency'
	| 'Datetime'
	| 'Indicators'
	| 'Inputs'
	| 'Labels'
	| 'Lines'
	| 'Maths'
	| 'Matrixes'
	| 'Requests'
	| 'Sessions'
	| 'Timeframe'
	| 'Strategy'
	| 'Strings'
	| 'Symbol Info';
