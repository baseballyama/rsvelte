import * as $ from 'svelte/internal/server';
import { Inspect } from '@components';
import { onMount } from 'svelte';
import { readable, writable } from 'svelte/store';
import { fromEvent, map, startWith } from 'rxjs';

export default function Stores($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let storesMode = 'full';
		let clicksObservable = void 0;

		function customStore(initialValue = 0) {
			let interval;

			let val = writable(initialValue, () => {
				interval = window.setInterval(
					() => {
						val.update((n) => n + 1);
					},
					500
				);

				return () => {
					window.clearInterval(interval);
				};
			});

			return {
				...val,
				set value(v) {
					val.set(v);
				}
			};
		}

		onMount(() => {
			clicksObservable = fromEvent(document.body, 'click').pipe(startWith(`0 clicks`), map((_, i) => `${i} clicks`));
		});

		const stores = $.derived(() => ({
			writableStore: writable('i am the store value'),
			test: writable('i am the\n store value'),
			readableStore: readable({ a: { b: { c: { d: { e: 'end' } } } } }),
			customStore: customStore(0),
			fakeStore: { subscribe: () => 'hi' }
		}));

		Inspect($$renderer, {
			class: 'not-content mt',
			values: { ...stores(), clicksObservable },
			expandLevel: 0,
			stores: storesMode
		});

		$$renderer.push(`<!----> <div class="input-row"><label>stores mode `);

		$$renderer.select({ value: storesMode }, ($$renderer) => {
			$$renderer.option({ value: false }, ($$renderer) => {
				$$renderer.push(`off (false)`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`full`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`value-only`);
			});
		});

		$$renderer.push(`</label></div>`);
	});
}