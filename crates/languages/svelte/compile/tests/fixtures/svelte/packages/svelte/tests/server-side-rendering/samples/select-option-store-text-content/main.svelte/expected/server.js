import * as $ from 'svelte/internal/server';
import { readable } from 'svelte/store';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const t = readable((/** @type {string} */ key) => key);
		let value = '';

		$$renderer.select({ value }, ($$renderer) => {
			$$renderer.option({ disabled: true, value: '' }, ($$renderer) => {
				$$renderer.push(`${$.escape($.store_get($$store_subs ??= {}, '$t', t)('placeholder'))}`);
			});

			$$renderer.option({ value: 'a' }, ($$renderer) => {
				$$renderer.push(`A`);
			});

			$$renderer.option({ value: 'b' }, ($$renderer) => {
				$$renderer.push(`B`);
			});
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}