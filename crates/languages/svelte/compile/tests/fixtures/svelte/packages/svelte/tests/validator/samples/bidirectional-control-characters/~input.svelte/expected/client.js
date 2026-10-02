import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`⁧⁦def⁩⁦abc⁩⁩ <h1></h1> ⁧⁦def⁩⁦abc⁩⁩`, 1);

export default function Input($$anchor) {
	let name = '\u2067\u2066rld\u2069\u2066wo\u2069\u2069';

	$.next();

	var fragment = root();
	var h1 = $.sibling($.first_child(fragment));

	h1.textContent = 'Hello, ⁧⁦rld⁩⁦wo⁩⁩!';
	$.next();
	$.append($$anchor, fragment);
}