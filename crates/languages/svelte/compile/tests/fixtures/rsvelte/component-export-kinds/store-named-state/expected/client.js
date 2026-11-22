import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
var root = $.from_html(`<p> </p>`);
export default function Store_named_state($$anchor, $$props) {
	$.push($$props, true);
	const $state = () => $.store_get(state, "$state", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const state = writable(1);
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, $state()));
	$.append($$anchor, p);
	$.pop();
	$$cleanup();
}
