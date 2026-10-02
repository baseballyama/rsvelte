import * as $ from 'svelte/internal/server';
import { a } from "./stores";

export default function $var_input($$renderer) {
	var $$store_subs;

	$.store_set(a, 42);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}