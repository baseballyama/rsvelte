import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
const data = $.proxy({ n: 0 });
const state = { data };
var root = $.from_html(`<p> </p>`);
export default function Store_rune_module($$anchor) {
	const $state = () => $.store_get(state, "$state", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, state.data.n));
	$.append($$anchor, p);
	$$cleanup();
}
