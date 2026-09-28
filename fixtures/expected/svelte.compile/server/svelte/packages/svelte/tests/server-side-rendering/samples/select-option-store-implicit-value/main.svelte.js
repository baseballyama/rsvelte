import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const value = writable('dog');
		const label = writable('Dog');

		$$renderer.select({ value: $.store_get($$store_subs ??= {}, '$value', value) }, ($$renderer) => {
			$$renderer.option({}, $.store_get($$store_subs ??= {}, '$label', label));

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`cat`);
			});
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}