import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="description" content="A"/>`);

export default function A($$anchor) {
	$.next();

	var text = $.text('A');

	$.head('idjjbq', ($$anchor) => {
		var meta = root();

		$.append($$anchor, meta);
	});

	$.append($$anchor, text);
}