import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance } from '$app/forms';

var root = $.from_html(`<form method="POST"><button type="submit">submit</button></form>`);

export default function _page($$anchor) {
	var form = root();

	$.action(form, ($$node) => enhance?.($$node));
	$.append($$anchor, form);
}