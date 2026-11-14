import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<!> <!>`, 1);
export default function Second_this_attribute($$anchor) {
	let tag = "div";
	let tag2 = "span";
	var fragment = root();
	var node = $.first_child(fragment);
	$.element(node, () => tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ this: tag2 }));
		var text = $.text("x");
		$.append($$anchor, text);
	});
	var node_1 = $.sibling(node, 2);
	$.component(node_1, () => C, ($$anchor, $$component) => {
		$$component($$anchor, { get this() {
			return C;
		} });
	});
	$.append($$anchor, fragment);
}
