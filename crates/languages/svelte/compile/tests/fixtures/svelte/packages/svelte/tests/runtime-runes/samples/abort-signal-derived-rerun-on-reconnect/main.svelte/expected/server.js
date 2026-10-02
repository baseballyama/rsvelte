import * as $ from 'svelte/internal/server';
import { getAbortSignal } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = true;
		let count = 0;
		let queued = [];

		function sleep(value, signal) {
			return new Promise((resolve, reject) => {
				signal.addEventListener('abort', reject, { once: true });
				queued.push(() => resolve(value));
			});
		}

		const double = $.derived(() => sleep(count * 2, getAbortSignal()));

		$$renderer.push(`<button>clicks: ${$.escape(count)}</button> <button>toggle</button> <button>resolve</button> <div>`);

		if (show) {
			$$renderer.push('<!--[0-->');

			$.await(
				$$renderer,
				double(),
				() => {
					$$renderer.push(`loading`);
				},
				(value) => {
					$$renderer.push(`${$.escape(value)}`);
				}
			);

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { sleep });
	});
}