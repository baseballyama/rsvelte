import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input/> <a>x</a> <!> <x-café></x-café>`, 3);
export default function Element_attributes_finding($$anchor) {
	const list = [1, 2];
	var fragment = root();
	var input = $.first_child(fragment);
	$.attribute_effect(input, () => ({ ...list }), void 0, void 0, void 0, void 0, true);
	var a = $.sibling(input, 2);
	$.attribute_effect(a, () => ({
		href: "x",
		...list,
		title: "t"
	}));
	var node = $.sibling(a, 2);
	$.element(node, () => "b", false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ ...list }));
		var text = $.text("x");
		$.append($$anchor, text);
	});
	var x_caf_ = $.sibling(node, 2);
	$.attribute_effect(x_caf_, () => ({ ...list }));
	$.append($$anchor, fragment);
}
