import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);

	var node_1 = $.sibling(node, 2);

	Foo(node_1, {});
	$.append($$anchor, fragment);
}