import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

var root = $.from_html(`<h2>Events</h2> <p>Try interacting with the list below and check the event log in the console.</p> <!>`, 1);

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