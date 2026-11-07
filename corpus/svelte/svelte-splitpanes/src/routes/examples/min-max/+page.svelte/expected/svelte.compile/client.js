import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';

var root = $.from_html(`<h2>Horizontal layout, push other panes, min & max use, doubleclick</h2> <p>You can double click a splitter to maximize the next pane! <br/> </p> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.sibling($.child(p), 2);

	text.nodeValue = ' If you want to disable the \'double click splitter to maximize\' behavior, you can add this attribute:\n  dblClickSplitter=false.';
	$.reset(p);

	var node = $.sibling(p, 2);

	ExampleArea(node, {
		get example() {
			return example;
		}
	});

	$.append($$anchor, fragment);
}