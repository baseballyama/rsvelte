import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

var root = $.from_html(
	`<h2>Styling Splitters - Modern</h2> <p>This examples uses CSS styles to pixel size panes and lock them in place. applied to panes in
  order to achieve the desired layout.</p> <!>`,
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