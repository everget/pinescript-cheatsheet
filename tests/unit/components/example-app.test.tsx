import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { App } from '../../../src/app.tsx';

describe('App', () => {
	it('loads and displays a headline with technical stack', async () => {
		const { debug } = render(<App />);

		await screen.findByRole('heading', { level: 1 });

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			/Pine Script Cheatsheet/
		);
	});
});
