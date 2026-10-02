import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Inline_expression_input($$anchor) {
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.event('keydown', button, () => console.log('foo'));
	$.event('keydown', button, () => console.log('foo'));
	$.event('keydown', button_1, () => console.log('foo'));
	$.event('keydown', button_1, () => console.log('foo'));
	$.append($$anchor, fragment);
}