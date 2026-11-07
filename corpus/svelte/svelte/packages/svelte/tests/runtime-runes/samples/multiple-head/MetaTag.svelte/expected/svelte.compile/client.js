import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="description"/> <meta name="author" content="@svelteawesome"/>`, 1);

export default function MetaTag($$anchor) {
	let title = 'Hello world';
	let desc = 'Some description';

	$.head('119wqki', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);

		$.set_attribute(meta, 'content', desc);
		$.next(2);

		$.effect(() => {
			$.document.title = 'Hello world';
		});

		$.append($$anchor, fragment);
	});
}