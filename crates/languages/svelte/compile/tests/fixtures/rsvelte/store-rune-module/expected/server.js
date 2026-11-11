import * as $ from "svelte/internal/server";
const data = { n: 0 };
const state = { data };
export default function Store_rune_module($$renderer) {
	var $$store_subs;
	$$renderer.push(`<p>${$.escape(state.data.n)}</p>`);
	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}
