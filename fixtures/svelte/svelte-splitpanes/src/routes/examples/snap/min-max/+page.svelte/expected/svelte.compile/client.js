import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

var root = $.from_html(`<h2>Min & max with snap</h2> <p>You can also snap to the panel maximum and minimum size.</p> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	ExampleArea(node, {
		get example() {
			return example;
		}
	});

	$.append($$anchor, fragment);
}