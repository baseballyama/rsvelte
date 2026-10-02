import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <!> `, 1);

export default function Main($$anchor) {
	const a = 1;
	const b = 2;
	const c = 3;

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = '1 ';

	var node = $.sibling(text);

	$.html(node, () => b);

	var text_1 = $.sibling(node);

	text_1.nodeValue = ' 3';
	$.append($$anchor, fragment);
}