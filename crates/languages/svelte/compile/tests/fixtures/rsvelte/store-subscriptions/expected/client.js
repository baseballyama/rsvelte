import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
import { page } from "$app/stores";
var root = $.from_html(`<p> </p> <input/> <button>x</button> <!>`, 1);
export default function Store_subscriptions($$anchor, $$props) {
	$.push($$props, true);
	const $count = () => $.store_get(count, "$count", $$stores);
	const $obj = () => $.store_get(obj, "$obj", $$stores);
	const $page = () => $.store_get(page, "$page", $$stores);
	const $store = () => $.store_get($$props.store, "$store", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);
	let obj = writable({ a: 1 });
	function inc() {
		$.store_set(count, $count() + 1);
		$.update_store(count, $count());
		$.store_mutate(obj, $.untrack($obj).a = 2, $.untrack($obj));
		$.store_set(obj, { a: 3 });
	}
	let d = $.derived(() => $count() * 2);
	console.log($page().url);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var input = $.sibling(p, 2);
	$.remove_input_defaults(input);
	var button = $.sibling(input, 2);
	var node = $.sibling(button, 2);
	$.each(node, 1, () => $obj().list, $.index, ($$anchor, item) => {
		$.next();
		var text_1 = $.text();
		$.template_effect(() => $.set_text(text_1, $.get(item)));
		$.append($$anchor, text_1);
	});
	$.template_effect(() => $.set_text(text, `${$count() ?? ""} ${$store() ?? ""} ${$obj().a ?? ""} ${$.get(d) ?? ""}`));
	$.bind_value(input, $count, ($$value) => $.store_set(count, $$value));
	$.delegated("click", button, () => $.store_set(count, 5));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
$.delegate(["click"]);
