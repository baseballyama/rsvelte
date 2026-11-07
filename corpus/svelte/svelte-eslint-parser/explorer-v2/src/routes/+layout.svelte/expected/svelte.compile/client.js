import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Header from '$lib/Header.svelte';
import '../app.css';

var root = $.from_html(`<!> <main class="main svelte-1sjlofm"><!></main>`, 1);

export default function _layout($$anchor, $$props) {
	if (typeof window !== 'undefined') {
		window.process = { cwd: () => '/' };
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(main);
	$.append($$anchor, fragment);
}