import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Widget from './Widget.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let a = writable({});
		let b = () => true;

		if ($.store_get($$store_subs ??= {}, '$a', a) || b()) {
			$$renderer.push('<!--[0-->');
			Widget($$renderer, {});
		} else {
			$$renderer.push(`<!--[-1--><pre>fail</pre>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}