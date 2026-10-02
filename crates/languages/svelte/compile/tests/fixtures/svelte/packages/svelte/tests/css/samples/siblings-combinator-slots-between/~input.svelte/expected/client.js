import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-l7si0u">test</h1> <!> <!> <!> <span class="svelte-l7si0u">Hello</span>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'a', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'b', {}, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'c', {}, null);
	$.next(2);
	$.append($$anchor, fragment);
}