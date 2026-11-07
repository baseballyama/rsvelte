import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	let store = null;
	const foo = { $store: $.store_get($$store_subs ??= {}, '$store', store) };
	const bar = { $store: $.store_get($$store_subs ??= {}, '$store', store) };

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}