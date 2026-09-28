import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<!> <p></p>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {});

	var p = $.sibling(node, 2);

	p.textContent = '42';
	$.append($$anchor, fragment);
}