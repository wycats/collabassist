import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4173,
		timeout: 300_000
	},
	use: {
		baseURL: 'http://localhost:4173'
	},
	testDir: 'e2e'
});
