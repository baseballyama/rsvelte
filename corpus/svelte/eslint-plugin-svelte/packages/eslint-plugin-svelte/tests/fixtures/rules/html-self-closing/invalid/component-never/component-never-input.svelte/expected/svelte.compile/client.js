import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!></div>`);

export default function Component_never_input($$anchor) {
	var div = root();
	var node = $.child(div);

	CustomElement(node, {});

	var node_1 = $.sibling(node, 2);

	I.Am.A.Foo(node_1, {});
	$.reset(div);
	$.append($$anchor, div);
}