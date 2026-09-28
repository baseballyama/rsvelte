import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Breadcrumb_skeleton_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Breadcrumb(node, { skeleton: true, count: 3 });

	var node_1 = $.sibling(node, 2);

	Breadcrumb(node_1, { noTrailingSlash: true, skeleton: true, count: 5 });
	$.append($$anchor, fragment);
}