import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="twitter:creator" content="@sveltejs"/>`);

export default function Main($$anchor) {
	$.head('d1l7pt', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'changed';
		});

		$.append($$anchor, meta);
	});
}