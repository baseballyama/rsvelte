import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './Button.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {});
	$.append($$anchor, fragment);
}