import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<textarea></textarea> <textarea placeholder="x"></textarea> <textarea></textarea> <textarea></textarea> <textarea></textarea> <textarea>static
text</textarea> <textarea>
lead</textarea> <textarea></textarea> <textarea></textarea> <textarea></textarea>`, 1);
export default function Textarea($$anchor, $$props) {
	$.push($$props, true);
	let text = $.state("");
	let p = $.prop($$props, "p", 15);
	let rest = {};
	var fragment = root();
	var textarea = $.first_child(fragment);
	$.remove_textarea_child(textarea);
	var textarea_1 = $.sibling(textarea, 2);
	$.remove_textarea_child(textarea_1);
	var textarea_2 = $.sibling(textarea_1, 2);
	$.set_value(textarea_2, "a");
	var textarea_3 = $.sibling(textarea_2, 2);
	$.remove_textarea_child(textarea_3);
	var textarea_4 = $.sibling(textarea_3, 2);
	$.set_value(textarea_4, "\nx");
	var textarea_5 = $.sibling(textarea_4, 6);
	$.remove_textarea_child(textarea_5);
	$.attribute_effect(textarea_5, () => ({ ...rest }));
	var textarea_6 = $.sibling(textarea_5, 4);
	$.remove_textarea_child(textarea_6);
	$.set_value(textarea_6, true);
	$.template_effect(() => $.set_value(textarea_3, $.get(text)));
	$.bind_value(textarea, () => $.get(text), ($$value) => $.set(text, $$value));
	$.bind_value(textarea_1, p);
	$.bind_value(textarea_5, () => $.get(text), ($$value) => $.set(text, $$value));
	$.append($$anchor, fragment);
	$.pop();
}
