import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<p slot="a"> </p>`);
var root_1 = $.from_html(`<!> <button></button>`, 1);
export default function Slot_element_const($$anchor) {
	let k = $.state(1);
	var fragment = root_1();
	var node = $.first_child(fragment);
	C(node, { $$slots: { a: ($$anchor, $$slotProps) => {
		const twice = $.derived(() => $.get(k) * 2);
		var p = root();
		var text = $.only_child(p, true);
		$.template_effect(() => $.set_text(text, $.get(twice)));
		$.append($$anchor, p);
	} } });
	var button = $.sibling(node, 2);
	$.delegated("click", button, () => $.update(k));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
