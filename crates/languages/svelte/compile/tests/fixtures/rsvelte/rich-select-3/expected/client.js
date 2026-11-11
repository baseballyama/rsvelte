import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Option from "./Option.svelte";
var root = $.from_html(`<option>Boundary</option>`);
var option_content = $.from_html(`<b> </b>`, 1);
var root_1 = $.from_html(`<select><!></select> <select><!></select> <select><option><!></option></select>`, 1);
export default function Rich_select_3($$anchor, $$props) {
	var fragment = root_1();
	var select = $.first_child(fragment);
	var node = $.child(select);
	$.boundary(node, {}, ($$anchor) => {
		var option = root();
		$.append($$anchor, option);
	});
	$.reset(select);
	var select_1 = $.sibling(select, 2);
	$.attribute_effect(select_1, () => ({
		...$$props.p,
		class: $$props.c
	}));
	$.customizable_select(select_1, () => {
		var anchor = $.child(select_1);
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);
		Option(node_1, {});
		$.append(anchor, fragment_1);
	});
	var select_2 = $.sibling(select_1, 2);
	$.attribute_effect(select_2, () => ({ ...$$props.p }));
	var option_1 = $.child(select_2);
	$.attribute_effect(option_1, () => ({
		class: $$props.c,
		...$$props.p
	}));
	$.customizable_select(option_1, () => {
		var anchor_1 = $.child(option_1);
		var fragment_2 = option_content();
		var b = $.first_child(fragment_2);
		var text = $.only_child(b, true);
		$.template_effect(() => $.set_text(text, $$props.c));
		$.append(anchor_1, fragment_2);
	});
	$.reset(select_2);
	$.append($$anchor, fragment);
}
