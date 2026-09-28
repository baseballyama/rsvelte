import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';

var root = $.from_html(`<h1>b</h1> <form method="POST"><button id="submit">submit</button></form>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.head('jllqd3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'b';
		});
	});

	var form = $.sibling($.first_child(fragment), 2);

	$.action(form, ($$node) => enhance?.($$node));
	$.append($$anchor, fragment);
}