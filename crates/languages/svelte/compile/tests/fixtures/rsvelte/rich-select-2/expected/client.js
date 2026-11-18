import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Option from "./Option.svelte";
var select_content = $.from_html(`<optgroup label="G"><!></optgroup><!>`, 1);
var option_content = $.from_html(`<b></b>`, 1);
var select_content_1 = $.from_html(`<!><option><!></option>`, 1);
var root = $.from_html(`<div><select><!></select></div> <select><!></select> <select><!></select>`, 1);
export default function Rich_select_2($$anchor) {
	let x = 1;
	let html = "";
	var fragment = root();
	var div = $.first_child(fragment);
	var select = $.child(div);
	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment_1 = $.comment();
		var node = $.first_child(fragment_1);
		Option(node, {});
		$.append(anchor, fragment_1);
	});
	$.reset(div);
	var select_1 = $.sibling(div, 2);
	$.customizable_select(select_1, () => {
		var anchor_1 = $.child(select_1);
		var fragment_2 = select_content();
		var optgroup = $.first_child(fragment_2);
		$.customizable_select(optgroup, () => {
			var anchor_2 = $.child(optgroup);
			var fragment_3 = $.comment();
			var node_1 = $.first_child(fragment_3);
			Option(node_1, {});
			$.append(anchor_2, fragment_3);
		});
		var node_2 = $.sibling(optgroup);
		$.html(node_2, () => html);
		$.append(anchor_1, fragment_2);
	});
	var select_2 = $.sibling(select_1, 2);
	$.customizable_select(select_2, () => {
		var anchor_3 = $.child(select_2);
		var fragment_4 = select_content_1();
		var node_3 = $.first_child(fragment_4);
		Option(node_3, {});
		var option = $.sibling(node_3);
		$.customizable_select(option, () => {
			var anchor_4 = $.child(option);
			var fragment_5 = option_content();
			var b = $.first_child(fragment_5);
			b.textContent = "1";
			$.append(anchor_4, fragment_5);
		});
		$.append(anchor_3, fragment_4);
	});
	select_2.value = select_2.__value = x, $.select_option(select_2, x);
	$.init_select(select_2);
	$.append($$anchor, fragment);
}
