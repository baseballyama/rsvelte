import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyInput } from "carbon-components-svelte";

export default function CopyInputAsync($$anchor, $$props) {
	$.push($$props, true);

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

	CopyInput($$anchor, {
		labelText: 'API token',
		type: 'password',
		value: displayValue,
		copy: copyToken,
		$$events: {
			'mouseenter:copy-button': prefetchToken,
			'copy:error': (e) => {
				console.error("Copy failed", e.detail.error);
			}
		}
	});

	$.pop();
}