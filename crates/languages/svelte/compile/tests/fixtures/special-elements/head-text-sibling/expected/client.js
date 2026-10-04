import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="description" content="A"/>`);

export default function Head_text_sibling($$anchor) {
	$.next();
	var text = $.text('A');
	$.head('8iq4dl', ($$anchor) => {
		var meta = root();
		$.append($$anchor, meta);
	});
	$.append($$anchor, text);
}
