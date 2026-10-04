import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="description" content="test"/>`);

var root_1 = $.from_html(`<p>Body</p>`);

export default function Head_static($$anchor) {
	var p = root_1();
	$.head('1p7qgav', ($$anchor) => {
		var meta = root();
		$.effect(() => {
			$.document.title = 'Hello & world';
		});
		$.append($$anchor, meta);
	});
	$.append($$anchor, p);
}
