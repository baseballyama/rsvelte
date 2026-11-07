import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<y class="svelte-1w7ricf">this should be green</y>`);
var root_1 = $.from_html(`<x class="svelte-1w7ricf"></x> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	Child(node, {
		children: ($$anchor, $$slotProps) => {
			var y = root();

			$.append($$anchor, y);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}