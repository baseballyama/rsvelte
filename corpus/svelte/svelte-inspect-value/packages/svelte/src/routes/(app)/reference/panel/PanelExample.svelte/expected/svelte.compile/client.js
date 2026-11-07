import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Todo from './Todo.svelte';

var root = $.from_html(`<h3>Demo</h3> <div id="panel-example" class="svelte-1hhtzqm"><!></div>`, 1);

export default function PanelExample($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	Todo(node, {});
	$.reset(div);
	$.append($$anchor, fragment);
}