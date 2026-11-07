import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <div></div> <!>`, 1);

export default function Template_literal_attribute_input($$anchor) {
	let foo = 'foo';
	let bar = 'bar';
	var fragment = root();
	var node = $.first_child(fragment);

	Foo(node, { attr: `prefix${foo}` });

	var div = $.sibling(node, 2);

	$.set_attribute(div, 'data-text', `prefix${foo}${bar}`);

	var node_1 = $.sibling(div, 2);

	Foo(node_1, { attr: `prefix${foo}` });
	$.append($$anchor, fragment);
}