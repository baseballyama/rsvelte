import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <div></div>`, 1);

export default function Valid_test01_input($$anchor) {
	let foo = 'foo';

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = 'foo \'foo\'\nfoo\nfoo\n1\n\nfoofoo\n{foo ';

	var div = $.sibling(text);

	$.set_attribute(div, 'data-text', 'foo \'foo\' foo foo 1 ');
	$.append($$anchor, fragment);
}