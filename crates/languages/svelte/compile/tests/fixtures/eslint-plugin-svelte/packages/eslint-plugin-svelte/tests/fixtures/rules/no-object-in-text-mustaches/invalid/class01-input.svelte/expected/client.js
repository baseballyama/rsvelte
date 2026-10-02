import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input/>`, 1);

export default function Class01_input($$anchor) {
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `${class A {} ?? ''} `;

	var input = $.sibling(text);

	$.set_class(input, 1, `${class B {} ?? ''} a`);
	$.append($$anchor, fragment);
}