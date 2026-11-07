import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function String01_input($$anchor) {
	const a = 'hello!';
	const b = `${a} world`;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, a);
	$.delegated('click', button_1, b);
	$.append($$anchor, fragment);
}

$.delegate(['click']);