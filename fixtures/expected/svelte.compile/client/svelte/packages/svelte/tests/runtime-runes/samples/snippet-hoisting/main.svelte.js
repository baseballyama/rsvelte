import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const snippet = ($$anchor) => {
	$.next();

	var text = $.text('Hello');

	$.append($$anchor, text);
};

var root = $.from_html(`<button>log snippet</button>`);

export default function Main($$anchor) {
	function log() {
		// Test that the log function is not hoisted. If it was, this would make the test
		// pass still, but Vitest would error because it sees that there are unhandled errors
		snippet;
	}

	var button = root();

	$.event('click', button, log);
	$.append($$anchor, button);
}