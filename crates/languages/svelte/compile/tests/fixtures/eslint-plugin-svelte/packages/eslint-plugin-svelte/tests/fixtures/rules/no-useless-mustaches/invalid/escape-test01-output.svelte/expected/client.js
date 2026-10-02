import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	` <div></div> \\\\
\\r
\\`,
	1
);

export default function Escape_test01_output($$anchor) {
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = '\n\n\r ';

	var div = $.sibling(text);

	$.set_attribute(div, 'data-text', '\r \n');
	$.next();
	$.append($$anchor, fragment);
}