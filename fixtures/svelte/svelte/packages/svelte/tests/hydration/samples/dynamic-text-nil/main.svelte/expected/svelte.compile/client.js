import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <hr/> <hr/> <p></p> <p></p>`, 1);

export default function Main($$anchor) {
	let maybeNull = null;
	let maybeUndefined = undefined;

	$.next();

	var fragment = root();
	var text = $.first_child(fragment, true);

	text.nodeValue = '';

	var text_1 = $.sibling(text, 2, true);

	text_1.nodeValue = '';

	var p = $.sibling(text_1, 3);
	var p_1 = $.sibling(p, 2);

	$.append($$anchor, fragment);
}