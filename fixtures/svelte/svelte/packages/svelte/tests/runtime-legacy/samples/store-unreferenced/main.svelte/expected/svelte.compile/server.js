import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';
import { count } from './store.js';

export default function Main($$renderer, $$props) {
	var $$store_subs;

	function increment() {
		$.update_store($$store_subs ??= {}, '$count', count);
	}

	Nested($$renderer, {});

	if ($$store_subs) $.unsubscribe_stores($$store_subs);

	$.bind_props($$props, { increment });
}