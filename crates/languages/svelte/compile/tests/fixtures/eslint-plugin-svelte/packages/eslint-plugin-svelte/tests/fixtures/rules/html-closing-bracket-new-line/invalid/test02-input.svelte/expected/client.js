import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <div></div> <div></div>`, 1);

export default function Test02_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	SingleLine(node, { class: 'foo' });

	var node_1 = $.sibling(node, 2);

	Multiline(node_1, { class: 'foo' });
	$.next(4);
	$.append($$anchor, fragment);
}