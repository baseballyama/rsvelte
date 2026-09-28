import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="twitter:creator"/>`);

export default function Main($$anchor) {
	let x = 'sveltejs';

	$.head('aq8dss', ($$anchor) => {
		var meta = root();

		$.set_attribute(meta, 'content', '@sveltejs');

		$.effect(() => {
			$.document.title = 'changed';
		});

		$.append($$anchor, meta);
	});
}