import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div>`, 1);

export default function Main($$anchor) {
	let name = 'hello';
	var fragment = root();
	var div = $.first_child(fragment);

	div.textContent = ' hello';

	var div_1 = $.sibling(div, 2);

	div_1.textContent = ' hello  ';

	var div_2 = $.sibling(div_1, 2);

	div_2.textContent = ' hello   hello';
	$.append($$anchor, fragment);
}