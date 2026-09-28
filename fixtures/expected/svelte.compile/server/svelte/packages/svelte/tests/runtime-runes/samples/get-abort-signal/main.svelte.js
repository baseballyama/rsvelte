import * as $ from 'svelte/internal/server';
import { getAbortSignal } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		let delayed_count = $.derived(async () => {
			let c = count;
			const signal = getAbortSignal();

			await new Promise((f) => setTimeout(f));

			if (signal.aborted) {
				console.log('aborted', signal.reason.name, signal.reason.message);
			}

			return c;
		});

		$$renderer.push(`<button>increment</button> `);

		$.await(
			$$renderer,
			delayed_count(),
			() => {
				$$renderer.push(`<p>loading...</p>`);
			},
			(count) => {
				$$renderer.push(`<p>${$.escape(count)}</p>`);
			}
		);

		$$renderer.push(`<!--]-->`);
	});
}