import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let result;

		function test_abort() {
			const controller = new AbortController();

			fetch('/request-abort', { method: 'POST', signal: controller.signal }).then((r) => r.json());

			setTimeout(
				async () => {
					controller.abort();

					// the server doesn't necessarily observe the abort immediately, so poll the
					// status endpoint until it reports that the request was aborted
					for (let i = 0; i < 50; i += 1) {
						const r = await fetch('/request-abort', { headers: { accept: 'application/json' } });

						result = await r.json();

						if (result && 'aborted' in result && result.aborted) return;

						await new Promise((r) => setTimeout(r, 50));
					}
				},
				50
			);
		}

		onMount(test_abort);
		$$renderer.push(`<pre>${$.escape(JSON.stringify(result))}</pre>`);
	});
}