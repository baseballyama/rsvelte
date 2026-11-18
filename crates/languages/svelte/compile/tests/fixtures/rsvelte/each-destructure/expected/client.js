import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<b> </b>`);
var root_3 = $.from_html(`<i> </i>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
export default function Each_destructure($$anchor, $$props) {
	let fallback = "none";
	const plain = [{
		name: "a",
		tags: ["x"]
	}];
	var fragment = root_4();
	var node = $.first_child(fragment);
	$.each(node, 17, () => $$props.items, ({ id, name, size = 1, ...rest }) => id, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		let name = () => $.get($$item).name;
		let size = $.derived_safe_equal(() => $.fallback($.get($$item).size, 1));
		let rest = () => $.exclude_from_object($.get($$item), [
			"id",
			"name",
			"size"
		]);
		var p = root();
		var text = $.only_child(p);
		$.template_effect(() => $.set_text(text, `${id() ?? ""} ${name() ?? ""} ${$.get(size) ?? ""} ${rest().extra ?? ""}`));
		$.append($$anchor, p);
	});
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 17, () => $$props.pairs, $.index, ($$anchor, $$item, i) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array)[0];
		let value = () => $.get($$array)[1];
		var span = root_1();
		var text_1 = $.only_child(span);
		$.template_effect(() => $.set_text(text_1, `${i}: ${key() ?? ""}=${value() ?? ""}`));
		$.append($$anchor, span);
	});
	var node_2 = $.sibling(node_1, 2);
	$.each(node_2, 17, () => plain, $.index, ($$anchor, $$item) => {
		var $$array_1 = $.derived(() => $.to_array($.get($$item).tags, 1));
		let name = () => $.get($$item).name;
		let first = $.derived_safe_equal(() => $.fallback($.get($$array_1)[0], fallback));
		var b = root_2();
		var text_2 = $.only_child(b);
		$.template_effect(() => $.set_text(text_2, `${name() ?? ""} ${$.get(first) ?? ""}`));
		$.append($$anchor, b);
	});
	var node_3 = $.sibling(node_2, 2);
	$.each(node_3, 17, () => $$props.fixed, $.index, ($$anchor, $$item) => {
		let label = () => $.get($$item).label;
		var i_1 = root_3();
		var text_3 = $.only_child(i_1, true);
		$.template_effect(() => $.set_text(text_3, label()));
		$.append($$anchor, i_1);
	});
	$.append($$anchor, fragment);
}
