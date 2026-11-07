import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	const state = 42;

	$.store_get($$store_subs ??= {}, '$state', state)();

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}