/// <reference types="vitest/config" />

import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const scriptExtensions = '{,m,c}{j,t}s{,x}';

// https://vitejs.dev/config/
export default defineConfig(() => ({
	plugins: [react()],
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
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
		},
	},
	server: {
		watch: {
			usePolling: true,
		},
		host: true,
		strictPort: true,
		port: 5173,
	},
}));
