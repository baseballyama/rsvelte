import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Widget(node, {});

	var node_1 = $.sibling(node, 2);

	Widget(node_1, {});
	$.append($$anchor, fragment);
}