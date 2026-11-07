import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <div></div> `, 1);

export default function Escape_test01_input($$anchor) {
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = '\n\n\r ';

	var div = $.sibling(text);

	$.set_attribute(div, 'data-text', '\r \n');

	var text_1 = $.sibling(div);

	text_1.nodeValue = ' \\\\\n\\r\n\\';
	$.append($$anchor, fragment);
}