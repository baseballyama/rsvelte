import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	var $$store_subs;
	let data; // Svelte allows the store to be initialized later

	$.store_get($$store_subs ??= {}, '$data', data);
	$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$data', data))}`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}