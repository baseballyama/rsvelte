import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const cache = new SvelteMap();

		function get_async(id) {
			const model = cache.get(id);

			if (!model) {
				const promise = new Promise(async () => {
					await Promise.resolve();
					cache.set(id, id.toString());
				}).then(() => cache.get(id));

				untrack(() => {
					cache.set(id, promise);
				});

				return promise;
			}

			return model;
		}

		const value = $.derived(() => get_async(1));
		const value2 = $.derived(() => get_async(1));

		// both values are read before the set 
		value();

		value2();

		if (value() instanceof Promise) {
			$$renderer.push(`<!--[0-->Loading`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(value())}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}