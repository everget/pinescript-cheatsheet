import path from 'path';
import { defineConfig } from 'vitest/config';

const scriptExtensions = '{,m,c}{j,t}s{,x}';

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './tests/unit/components/setup.ts',
		include: [
			`src/**/*.{test,spec}.${scriptExtensions}`,
			`tests/unit/**/*.{test,spec}.${scriptExtensions}`,
		],
		coverage: {
			provider: 'v8' as const,
			reporter: ['text', 'json', 'html'],
		},
	},
});
