import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var option_content = $.from_html(`<span> </span>`, 1);
var option_content_1 = $.from_html(`<em>Italic</em> text`, 1);
var option_content_2 = $.from_html(`<strong>Bold</strong>`, 1);
var root = $.from_html(`<select><option><!></option><option><!></option></select> <select><optgroup label="G"><option><!></option></optgroup></select>`, 1);
export default function Rich_select_1($$anchor) {
	let x = $.state(1);
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);
	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment_1 = option_content();
		var span = $.first_child(fragment_1);
		var text = $.only_child(span);
		$.template_effect(() => $.set_text(text, `Rich ${$.get(x) ?? ""}`));
		$.append(anchor, fragment_1);
	});
	var option_1 = $.sibling(option);
	$.customizable_select(option_1, () => {
		var anchor_1 = $.child(option_1);
		var fragment_2 = option_content_1();
		$.next();
		$.append(anchor_1, fragment_2);
	});
	option_1.value = option_1.__value = "b";
	$.reset(select);
	var select_1 = $.sibling(select, 2);
	var optgroup = $.child(select_1);
	var option_2 = $.child(optgroup);
	$.customizable_select(option_2, () => {
		var anchor_2 = $.child(option_2);
		var fragment_3 = option_content_2();
		$.append(anchor_2, fragment_3);
	});
	$.reset(optgroup);
	$.reset(select_1);
	$.init_select(select_1);
	$.bind_select_value(select_1, () => $.get(x), ($$value) => $.set(x, $$value));
	$.append($$anchor, fragment);
}
