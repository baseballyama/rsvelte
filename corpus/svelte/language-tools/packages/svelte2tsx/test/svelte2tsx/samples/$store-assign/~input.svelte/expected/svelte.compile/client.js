import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = writable([]);

	$.store_mutate(store, $.untrack($store)[1] = true, $.untrack($store));
	$.store_mutate(store, $.untrack($store).foo = true, $.untrack($store));
	$.store_mutate(store, $.untrack($store)[1] = true, $.untrack($store));
	$.store_mutate(store, $.untrack($store).foo = true, $.untrack($store));
	$.store_set(store, true);
	$.store_set(store, true);
	hello[$store()] = true;

	(
		$.store_set(store, true),
		$.store_set(store, false),
		$store(),
		$.store_mutate(store, $.untrack($store).a = true, $.untrack($store))
	);

	(
		$.store_mutate(store, $.untrack($store).a = true, $.untrack($store)),
		$.store_mutate(store, $.untrack($store).b = false, $.untrack($store))
	);

	$$cleanup();
}