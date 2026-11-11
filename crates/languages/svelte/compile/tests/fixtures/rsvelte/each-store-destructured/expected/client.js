import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { writable } from "svelte/store";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<button> </button>`);
var root_2 = $.from_html(`<input/>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
export default function Each_store_destructured($$anchor, $$props) {
	$.push($$props, true);
	const $items = () => $.store_get(items, "$items", $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const items = writable([]);
	var fragment = root_3();
	var node = $.first_child(fragment);
	$.each(node, 3, $items, ({ name, icon = 1 }) => name, ($$anchor, $$item, i) => {
		let name = () => $.get($$item).name;
		let icon = $.derived_safe_equal(() => $.fallback($.get($$item).icon, 1));
		var p = root();
		var text = $.only_child(p);
		$.template_effect(() => $.set_text(text, `${name() ?? ""}${$.get(icon) ?? ""}${$.get(i) ?? ""}`));
		$.append($$anchor, p);
	});
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 1, $items, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let a = () => $.get($$array)[0];
		let b = () => $.get($$array)[1];
		var button = root_1();
		var text_1 = $.only_child(button);
		$.template_effect(() => $.set_text(text_1, `${a() ?? ""}${b() ?? ""}`));
		$.delegated("click", button, () => {
			a().x = 1, $.invalidate_store($$stores, "$items");
		});
		$.append($$anchor, button);
	});
	var node_2 = $.sibling(node_1, 2);
	$.each(node_2, 1, $items, $.index, ($$anchor, $$item) => {
		let c = () => $.get($$item).c;
		var input = root_2();
		$.remove_input_defaults(input);
		$.bind_value(input, () => c().v, ($$value) => (c().v = $$value, $.invalidate_store($$stores, "$items")));
		$.append($$anchor, input);
	});
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
$.delegate(["click"]);
