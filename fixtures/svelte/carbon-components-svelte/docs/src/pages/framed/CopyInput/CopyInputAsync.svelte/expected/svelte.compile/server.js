import * as $ from 'svelte/internal/server';
import { CopyInput } from "carbon-components-svelte";

export default function CopyInputAsync($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const displayValue = "sk-••••••••••••";

		// For demo purposes only: NEVER hardcode secrets in production.
		const secretToken = "sk-1234567890abcdef";

		let cachedToken = null;

		async function prefetchToken() {
			if (cachedToken) return;

			await new Promise((resolve) => setTimeout(resolve, 300));
			cachedToken = secretToken;
		}

		async function copyToken() {
			if (!cachedToken) {
				await prefetchToken();
			}

			await navigator.clipboard.writeText(cachedToken);
		}

		CopyInput($$renderer, {
			labelText: 'API token',
			type: 'password',
			value: displayValue,
			copy: copyToken
		});
	});
}