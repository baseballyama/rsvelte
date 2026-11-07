import * as $ from 'svelte/internal/server';

export default function Rename5($$renderer) {
	var $$store_subs;
	let store = null;

	$.store_get($$store_subs ??= {}, '$store', store);

	if ($.store_get($$store_subs ??= {}, '$store', store)) {}

	const foo = { $store: $.store_get($$store_subs ??= {}, '$store', store) };

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$store', store))} `);

	if ($.store_get($$store_subs ??= {}, '$store', store)) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}