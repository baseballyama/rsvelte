import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';

export default function Ts_unused_in_script_input($$renderer) {
	var $$store_subs;

	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$page', page))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}