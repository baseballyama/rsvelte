import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div contenteditable="true"> </div> <div contenteditable=""><!> <span> </span></div> <div contenteditable="plaintext-only"> </div> <p> </p>`, 1);
export default function Bound_editable_children($$anchor) {
	let value = $.state(1);
	let other = $.state("x");
	var fragment = root_1();
	var div = $.first_child(fragment);
	var text = $.child(div, true);
	text.nodeValue = $.get(value);
	$.reset(div);
	var div_1 = $.sibling(div, 2);
	{
		const raw = ($$anchor) => {
			var p = root();
			var text_1 = $.child(p);
			text_1.nodeValue = `${$.get(value) ?? ""} and ${$.get(other) ?? ""}`;
			$.reset(p);
			$.append($$anchor, p);
		};
		var node = $.child(div_1);
		raw(node);
		var span = $.sibling(node, 2);
		var text_2 = $.child(span, true);
		text_2.nodeValue = $.get(other);
		$.reset(span);
		$.reset(div_1);
		$.bind_content_editable("innerHTML", div_1, () => $.get(other), ($$value) => $.set(other, $$value));
	}
	var div_2 = $.sibling(div_1, 2);
	var text_3 = $.only_child(div_2, true);
	var p_1 = $.sibling(div_2, 2);
	var text_4 = $.only_child(p_1, true);
	$.template_effect(() => {
		$.set_text(text_3, $.get(other));
		$.set_text(text_4, $.get(value));
	});
	$.bind_content_editable("innerText", div, () => $.get(value), ($$value) => $.set(value, $$value));
	$.bind_content_editable("textContent", div_2, () => $.get(other), ($$value) => $.set(other, $$value));
	$.append($$anchor, fragment);
}
