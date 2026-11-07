import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <someelement attrname="text" attrcase=""></someelement>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	SomeComponent(node, { attrName: 'text', attrCase: 'text' });
	$.next(2);
	$.append($$anchor, fragment);
}