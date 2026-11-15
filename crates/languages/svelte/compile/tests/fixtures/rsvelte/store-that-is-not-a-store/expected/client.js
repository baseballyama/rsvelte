import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Store_that_is_not_a_store($$anchor) {
	const $count = () => $.store_get(count, "$count", $$stores);
	const $later = () => $.store_get(later, "$later", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let count = 1;
	let later;
	const doubled = $count() * 2;
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${$count() ?? ""} ${doubled} ${$later() ?? ""}`));
	$.append($$anchor, p);
	$$cleanup();
}
