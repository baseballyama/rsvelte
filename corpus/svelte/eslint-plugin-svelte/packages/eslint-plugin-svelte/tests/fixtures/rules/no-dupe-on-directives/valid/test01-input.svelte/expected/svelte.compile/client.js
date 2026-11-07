import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Test01_input($$anchor, $$props) {
	function myHandler() {}
	function foo() {}
	function bar() {}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button, myHandler);
	$.event('click', button_1, foo);
	$.event('click', button_1, bar);
	$.append($$anchor, fragment);
}