import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>a</h1>`);

export default function _page($$anchor) {
	var h1 = root();

	$.head('1y47usg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'a';
		});
	});

	$.append($$anchor, h1);
}