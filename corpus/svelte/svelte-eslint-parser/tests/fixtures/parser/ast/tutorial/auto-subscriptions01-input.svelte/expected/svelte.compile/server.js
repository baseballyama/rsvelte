import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { count } from './stores.js';
import Incrementer from './Incrementer.svelte';
import Decrementer from './Decrementer.svelte';
import Resetter from './Resetter.svelte';

export default function Auto_subscriptions01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let count_value;

		const unsubscribe = count.subscribe((value) => {
			count_value = value;
		});

		onDestroy(unsubscribe);
		$$renderer.push(`<h1>The count is ${$.escape($.store_get($$store_subs ??= {}, '$count', count))}</h1> `);
		Incrementer($$renderer, {});
		$$renderer.push(`<!----> `);
		Decrementer($$renderer, {});
		$$renderer.push(`<!----> `);
		Resetter($$renderer, {});
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}