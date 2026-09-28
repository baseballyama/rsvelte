import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Async from './Async.svelte';
import Binding from './Binding.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Async(node, {});

	var node_1 = $.sibling(node, 2);

	Binding(node_1, {});
	$.append($$anchor, fragment);
}