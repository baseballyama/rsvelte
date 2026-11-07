import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const value = writable('dog');

		$$renderer.select({ value: $.store_get($$store_subs ??= {}, '$value', value) }, ($$renderer) => {
			$$renderer.option({ value: '' }, ($$renderer) => {
				$$renderer.push(`--Please choose an option--`);
			});

			$$renderer.option({ value: 'dog' }, ($$renderer) => {
				$$renderer.push(`Dog`);
			});

			$$renderer.option({ value: 'cat' }, ($$renderer) => {
				$$renderer.push(`Cat`);
			});
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}