import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="test" content="value"/>`);

export default function Head($$anchor) {
	$.head('8arnqj', ($$anchor) => {
		var meta = root();

		$.append($$anchor, meta);
	});
}