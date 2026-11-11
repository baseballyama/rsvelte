import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <!> <!> <!>`, 1);
export default function Dynamic_element_interpolated($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);
	$.element(node, () => "h", false);
	var node_1 = $.sibling(node, 2);
	$.element(node_1, () => $$props.t, false);
	var node_2 = $.sibling(node_1, 2);
	$.element(node_2, () => "d&amp;v", false);
	var node_3 = $.sibling(node_2, 2);
	$.element(node_3, () => $$props.t, false);
	$.append($$anchor, fragment);
}
