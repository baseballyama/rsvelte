import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Header from './Header.svelte';
import Footer from './Footer.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Child($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {});

	var node_1 = $.sibling(node, 2);

	Footer(node_1, {});
	$.append($$anchor, fragment);
}