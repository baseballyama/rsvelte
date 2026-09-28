import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p> <p>Hello world, what's up? this & that</p> <p> <span></span> this & that</p>`, 1);

export default function Main($$anchor) {
	let name = 'world';
	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = 'Hello world, what\'s up? this & that';

	var p_1 = $.sibling(p, 4);
	var text = $.child(p_1);

	text.nodeValue = 'Hello world, what\'s up?';
	$.next(2);
	$.reset(p_1);
	$.append($$anchor, fragment);
}