import * as $ from 'svelte/internal/server';
import { toStore } from 'svelte/store';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const currentValue = toStore(() => data.value);

		$$renderer.push(`<p>Current value: <span>${$.escape($.store_get($$store_subs ??= {}, '$currentValue', currentValue))}</span></p>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}