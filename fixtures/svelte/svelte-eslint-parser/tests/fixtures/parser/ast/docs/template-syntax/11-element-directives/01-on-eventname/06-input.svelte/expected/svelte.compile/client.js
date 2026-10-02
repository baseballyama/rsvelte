import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click me!</button>`);

export default function _6_input($$anchor) {
	let counter = 0;

	function increment() {
		counter = counter + 1;
	}

	function track(event) {
		trackEvent(event);
	}

	var button = root();

	$.event('click', button, increment);
	$.event('click', button, track);
	$.append($$anchor, button);
}