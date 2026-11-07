import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click me</button>`);

export default function Event_modifiers_input($$anchor) {
	function handleClick() {
		alert('no more alerts');
	}

	var button = root();

	$.event('click', button, $.once(handleClick));
	$.append($$anchor, button);
}