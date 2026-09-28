import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { attrs } = $$props;

		function increment() {
			$.store_get($$store_subs ??= {}, '$attrs', attrs).count++;
		}

		$$renderer.push(`<button>${$.escape($.store_get($$store_subs ??= {}, '$attrs', attrs).count)}</button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}