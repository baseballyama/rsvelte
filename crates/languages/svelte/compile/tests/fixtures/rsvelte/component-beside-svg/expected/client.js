import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_svg(`<!><svg><!><g></g></svg><!>`, 1);
export default function Component_beside_svg($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);
	C(node, {});
	var svg = $.sibling(node);
	var node_1 = $.child(svg);
	C(node_1, {});
	$.next();
	$.reset(svg);
	var node_2 = $.sibling(svg);
	C(node_2, {});
	$.append($$anchor, fragment);
}
