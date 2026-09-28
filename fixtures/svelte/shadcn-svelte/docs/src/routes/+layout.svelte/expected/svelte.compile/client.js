import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TailwindIndicator from "$lib/components/tailwind-indicator.svelte";
import "../app.css";

var root = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	TailwindIndicator(node, {});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children);
	$.append($$anchor, fragment);
}