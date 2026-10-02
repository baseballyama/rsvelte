import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Await_input($$anchor) {
	let foo;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => foo, null, ($$anchor, bar) => {
		var button = root();

		$.event('click', button, () => $.get(bar)());
		$.append($$anchor, button);
	});

	$.append($$anchor, fragment);
}