import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input value="x"/> <input/> <input type="checkbox" checked=""/> <input type="checkbox"/> <textarea>content</textarea> <textarea></textarea>`, 1);
export default function Default_value($$anchor) {
	let d = "y";
	var fragment = root();
	var input = $.first_child(fragment);
	$.set_default_value(input, d);
	var input_1 = $.sibling(input, 2);
	input_1.defaultValue = d;
	var input_2 = $.sibling(input_1, 2);
	$.set_default_checked(input_2, false);
	var input_3 = $.sibling(input_2, 2);
	input_3.defaultChecked = false;
	var textarea = $.sibling(input_3, 2);
	$.set_default_value(textarea, d);
	var textarea_1 = $.sibling(textarea, 2);
	textarea_1.defaultValue = d;
	$.append($$anchor, fragment);
}
