import * as $ from "svelte/internal/server";
const state = { a: 1 };
export default function Store_rune_split($$renderer) {
	var $$store_subs;
	let count = $.store_get($$store_subs ??= {}, "$state", state)(0);
	$$renderer.push(`<button>${$.escape(count)} ${$.escape(state.a)}</button>`);
	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}
