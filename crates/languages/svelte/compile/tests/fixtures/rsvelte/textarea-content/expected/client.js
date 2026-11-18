import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<textarea></textarea> <textarea></textarea> <textarea></textarea> <textarea></textarea>`, 1);
export default function Textarea_content($$anchor) {
	let a = "x";
	var fragment = root();
	var textarea = $.first_child(fragment);
	$.remove_textarea_child(textarea);
	$.set_value(textarea, "\nx b");
	var textarea_1 = $.sibling(textarea, 2);
	$.remove_textarea_child(textarea_1);
	$.set_value(textarea_1, "x & x!");
	var textarea_2 = $.sibling(textarea_1, 2);
	$.remove_textarea_child(textarea_2);
	$.set_value(textarea_2, "x c");
	var textarea_3 = $.sibling(textarea_2, 2);
	$.remove_textarea_child(textarea_3);
	$.set_value(textarea_3, "<b>x</b>");
	$.append($$anchor, fragment);
}
