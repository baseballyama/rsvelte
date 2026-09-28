import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import Inspect from '$lib/index.js';
import { GLOBAL_OPTIONS_CONTEXT } from '$lib/options.svelte.js';
import { fromEvent, map, Observable, startWith } from 'rxjs';
import { getContext, onMount } from 'svelte';
import { readable, writable } from 'svelte/store';

export default function Stores($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		getContext('toc')?.set('Stores', 'stores');

		const _globalInspectOptions = getContext(GLOBAL_OPTIONS_CONTEXT)();
		const _setOption = getContext('set-global-option');

		function customStore(initialValue = 0) {
			let interval;

			let val = writable(initialValue, () => {
				if (browser) {
					interval = window.setInterval(
						() => {
							val.update((n) => n + 1);
						},
						500
					);
				}

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

		let eventObservable = void 0;

		onMount(() => {
			eventObservable = fromEvent(document.body, 'click').pipe(startWith(`0 clicks`), map((_, i) => `${i} clicks`));

			let subscription = eventObservable.subscribe();
			const st = writable(0);
			let s = st.subscribe(() => {});

			return () => {
				subscription.unsubscribe();
				s();
			};
		});

		const stores = $.derived(() => ({
			writableStore: writable('i am the store value'),
			test: writable('i am the\n store value'),
			readableStore: readable({ a: { b: { c: { d: { e: 'end' } } } } }),
			customStore: customStore(0),
			clickObservable: eventObservable,
			fakeStore: { subscribe: () => 'hi' }
		}));

		$$renderer.push(`<div class="flex col"><h3 id="stores">Stores</h3> <p>Objects with a <code>subscribe</code> function are recognized as stores or observables. The
    stores will be subscribed to and the latest emitted value will be displayed.<br/> If the store does not return a valid <dfn title="function or object with unsubscribe-function">unsubscriber</dfn> or the subscribe-function
    throws an error the store will be displayed as a regular object using the default object-view.</p> `);

		if (Inspect.Values.Expand0) {
			$$renderer.push('<!--[-->');
			Inspect.Values.Expand0($$renderer, $.spread_props([stores()]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <p>This can be enabled / disabled with the <code>stores</code>-prop.</p></div>`);
	});
}