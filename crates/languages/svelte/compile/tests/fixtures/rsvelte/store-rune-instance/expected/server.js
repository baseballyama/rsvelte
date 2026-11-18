import * as $ from "svelte/internal/server";
export default function Store_rune_instance($$renderer) {
	var $$store_subs;
	const state = { a: 1 };
	let count = $.store_get($$store_subs ??= {}, "$state", state)(0);
	$$renderer.push(`<button>${$.escape(count)} ${$.escape(state.a)}</button>`);
	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}
