import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/> <button type="button"></button> <input type="checkbox"/> <button></button>`, 1);

export default function Test01_input($$anchor) {
	function click() {}

	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);
	var button_1 = $.sibling(button, 4);

	$.event('click', button, click);
	$.event('click', button_1, click);
	$.append($$anchor, fragment);
}