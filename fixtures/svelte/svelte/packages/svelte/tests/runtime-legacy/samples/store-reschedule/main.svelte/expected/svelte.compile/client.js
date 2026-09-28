import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {});

	var node_1 = $.sibling(node, 2);

	Child(node_1, {});
	$.append($$anchor, fragment);
}