import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	let interfaceStore;

	// error
	$.store_get($$store_subs ??= {}, '$interfaceStore', interfaceStore).fn();

	const result1 = $.store_get($$store_subs ??= {}, '$interfaceStore', interfaceStore)
		? $.store_get($$store_subs ??= {}, '$interfaceStore', interfaceStore).fn() === '1'
		: false;

	result1;

	// ok
	$.store_get($$store_subs ??= {}, '$interfaceStore', interfaceStore)?.fn();

	const result2 = $.store_get($$store_subs ??= {}, '$interfaceStore', interfaceStore)
		? $.store_get($$store_subs ??= {}, '$interfaceStore', interfaceStore).fn() === 1
		: false;

	result2;

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}