import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Input($$anchor, $$props) {
	function log(message) {}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button_1, (e) => log(e));
	$.append($$anchor, fragment);
}