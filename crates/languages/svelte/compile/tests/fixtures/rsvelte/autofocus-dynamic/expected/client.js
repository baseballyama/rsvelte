import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input/> <input/> <input/> <textarea></textarea> <div><input value="x"/></div> <input/>`, 1);
export default function Autofocus_dynamic($$anchor, $$props) {
	let focus = $.prop($$props, "focus", 3, false), a = $.prop($$props, "a", 3, true);
	let s = true;
	var fragment = root();
	var input = $.first_child(fragment);
	$.autofocus(input, focus());
	var input_1 = $.sibling(input, 2);
	$.autofocus(input_1, true);
	var input_2 = $.sibling(input_1, 2);
	$.autofocus(input_2, true);
	var textarea = $.sibling(input_2, 2);
	$.autofocus(textarea, s);
	var div = $.sibling(textarea, 2);
	var input_3 = $.child(div);
	$.autofocus(input_3, a());
	$.reset(div);
	var input_4 = $.sibling(div, 2);
	$.attribute_effect(input_4, () => ({
		...{ a: a() },
		autofocus: focus()
	}), void 0, void 0, void 0, void 0, true);
	$.append($$anchor, fragment);
}
