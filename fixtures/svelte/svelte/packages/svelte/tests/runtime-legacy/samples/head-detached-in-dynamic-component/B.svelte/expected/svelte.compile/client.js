import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="description" content="B"/>`);

export default function B($$anchor) {
	$.next();

	var text = $.text('B');

	$.head('1wk0d0t', ($$anchor) => {
		var meta = root();

		$.append($$anchor, meta);
	});

	$.append($$anchor, text);
}