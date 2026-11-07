import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><!></p> <p><!></p>`, 1);

export default function Child($$anchor, $$props) {
	var fragment = root();
	var p = $.first_child(fragment);
	var node = $.child(p);

	$.slot(node, $$props, 'default', { foo: 'foo' }, null);
	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var node_1 = $.child(p_1);

	$.slot(node_1, $$props, 'named', { bar: 'bar' }, null);
	$.reset(p_1);
	$.append($$anchor, fragment);
}