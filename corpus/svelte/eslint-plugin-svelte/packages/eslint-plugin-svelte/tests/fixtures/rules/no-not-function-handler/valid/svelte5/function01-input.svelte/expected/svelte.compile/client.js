import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Function01_input($$anchor) {
	let a = 'hello!';

	function fn() {}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => a);
	$.delegated('click', button_1, fn);
	$.append($$anchor, fragment);
}

$.delegate(['click']);