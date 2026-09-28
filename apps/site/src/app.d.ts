declare global {
	namespace App {
		interface Platform {
			env: { ASSETS: { fetch: typeof fetch } };
		}
	}
}

export {};
