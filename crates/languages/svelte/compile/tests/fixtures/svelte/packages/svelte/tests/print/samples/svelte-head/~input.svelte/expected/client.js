import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="description" content="This is where the description goes for SEO"/>`);

export default function Input($$anchor) {
	$.head('m1jztp', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Hello world!';
		});

		$.append($$anchor, meta);
	});
}