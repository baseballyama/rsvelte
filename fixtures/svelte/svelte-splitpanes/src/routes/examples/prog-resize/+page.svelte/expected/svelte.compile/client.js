import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

var root = $.from_html(
	`<h2>Programmatic resizing</h2> <p>This example shows the programmatic way of resizing panes with two-way data biding. And how it
  works both ways. <br/> Changing programmatically the size one pane, will shrink/expand the other panes that have no specified
  size, as you can see in the example.</p> <!>`,
	1
);

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