import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	let a;

	$.store_get($$store_subs ??= {}, '$a', a);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}