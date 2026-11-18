import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var option_content = $.from_html(`<span> </span>`, 1);
var root = $.from_html(`<option><!></option>`);
var select_content = $.from_html(`<button dir="auto"><selectedcontent></selectedcontent></button><!>`, 1);
var select_content_1 = $.from_html(`<button><b>pick</b><selectedcontent></selectedcontent></button><option>one</option>`, 1);
var root_1 = $.from_html(`<select><!></select> <select><!></select>`, 1);
export default function Selectedcontent($$anchor, $$props) {
	let value = $.prop($$props, "value", 7);
	var fragment = root_1();
	var select = $.first_child(fragment);
	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment_1 = select_content();
		var button = $.first_child(fragment_1);
		var selectedcontent = $.child(button);
		$.selectedcontent(selectedcontent, ($$element) => selectedcontent = $$element);
		$.reset(button);
		var node = $.sibling(button);
		$.each(node, 17, () => $$props.items, $.index, ($$anchor, item) => {
			var option = root();
			$.customizable_select(option, () => {
				var anchor_1 = $.child(option);
				var fragment_2 = option_content();
				var span = $.first_child(fragment_2);
				var text = $.only_child(span, true);
				$.template_effect(() => $.set_text(text, $.get(item)));
				$.append(anchor_1, fragment_2);
			});
			var option_value = {};
			$.template_effect(() => {
				if (option_value !== (option_value = $.get(item))) {
					option.value = (option.__value = option_value) ?? "";
				}
			});
			$.append($$anchor, option);
		});
		$.template_effect(() => button.dir = button.dir);
		$.append(anchor, fragment_1);
	});
	$.init_select(select);
	var select_1 = $.sibling(select, 2);
	$.customizable_select(select_1, () => {
		var anchor_2 = $.child(select_1);
		var fragment_3 = select_content_1();
		var button_1 = $.first_child(fragment_3);
		var selectedcontent_1 = $.sibling($.child(button_1));
		$.selectedcontent(selectedcontent_1, ($$element) => selectedcontent_1 = $$element);
		$.reset(button_1);
		$.next();
		$.append(anchor_2, fragment_3);
	});
	$.bind_select_value(select, value);
	$.append($$anchor, fragment);
}
