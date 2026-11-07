import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<link rel="stylesheet" href="tutorial/dark-theme.css"/>`);

export default function _2_input($$anchor) {
	$.head('1q0436d', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});
}