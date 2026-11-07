import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input type="number"/>`, 1);

export default function Main($$anchor) {
	let count = 1;
	let double = $.derived(() => count * 2);
	let binding = $.state(null);

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `1 ${$.get(double) ?? ''} `;

	var input = $.sibling(text);

	$.remove_input_defaults(input);
	$.bind_value(input, () => $.get(binding), ($$value) => $.set(binding, $$value));
	$.append($$anchor, fragment);
}