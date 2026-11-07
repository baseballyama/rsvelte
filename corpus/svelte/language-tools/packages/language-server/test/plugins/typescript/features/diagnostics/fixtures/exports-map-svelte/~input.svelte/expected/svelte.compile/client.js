import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DefaultSvelteWithTS from 'package';
import SubWithDTS from 'package/x';
import SubWithoutDTSAndNotTS from 'package/y';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	// with https://github.com/sveltejs/language-tools/pull/2478 this would work; needs decision if we want that
	DefaultSvelteWithTS(node, {});

	var node_1 = $.sibling(node, 2);

	SubWithDTS(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	SubWithoutDTSAndNotTS(node_2, {});
	$.append($$anchor, fragment);
}