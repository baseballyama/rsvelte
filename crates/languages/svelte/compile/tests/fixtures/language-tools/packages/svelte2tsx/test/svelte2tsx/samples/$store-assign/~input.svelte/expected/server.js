import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	const store = writable([]);

	$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store)[1] = true);
	$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).foo = true);
	$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store)[1] = true);
	$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).foo = true);
	$.store_set(store, true);
	$.store_set(store, true);
	hello[$.store_get($$store_subs ??= {}, '$store', store)] = true;

	(
		$.store_set(store, true),
		$.store_set(store, false),
		$.store_get($$store_subs ??= {}, '$store', store),
		$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).a = true)
	);

	(
		$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).a = true),
		$.store_mutate($$store_subs ??= {}, '$store', store, $.store_get($$store_subs ??= {}, '$store', store).b = false)
	);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}