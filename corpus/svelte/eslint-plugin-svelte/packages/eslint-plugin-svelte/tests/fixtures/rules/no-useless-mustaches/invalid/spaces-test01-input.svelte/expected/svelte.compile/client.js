import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <div></div>`, 1);

export default function Spaces_test01_input($$anchor) {
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = 'foo\nfoo ';

	var div = $.sibling(text);

	$.set_attribute(div, 'data-text', 'foo \'');
	$.append($$anchor, fragment);
}