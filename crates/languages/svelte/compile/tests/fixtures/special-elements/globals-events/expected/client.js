import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Body</p>`);

export default function Globals_events($$anchor) {
	function handler(event) {
		console.log(event.type);
	}
	var p = root();
	$.event('click', $.window, handler);
	$.event('resize', $.window, handler);
	$.event('keydown', $.document, handler);
	$.event('touchstart', $.document.body, handler, void 0, true);
	$.append($$anchor, p);
}
