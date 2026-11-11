import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<button> </button>`);
export default function Store_rune_instance($$anchor) {
	const $state = () => $.store_get(state, "$state", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const state = { a: 1 };
	let count = $state()(0);
	var button = root();
	var text = $.only_child(button);
	$.template_effect(() => $.set_text(text, `${count ?? ""} ${state.a ?? ""}`));
	$.delegated("click", button, () => count++);
	$.append($$anchor, button);
	$$cleanup();
}
$.delegate(["click"]);
