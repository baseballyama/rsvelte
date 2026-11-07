import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input/>`, 1);

export default function Function01_input($$anchor) {
	let a = 'hello!';

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `${() => a}
${function () {
		return a;
	}} `;

	var input = $.sibling(text);

	$.set_class(input, 1, `${() => a} a`);
	$.append($$anchor, fragment);
}