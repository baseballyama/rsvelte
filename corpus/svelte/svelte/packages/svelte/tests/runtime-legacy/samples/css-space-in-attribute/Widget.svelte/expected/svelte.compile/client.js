import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="foo bar svelte-1ot66wt">red on black</p>`);

export default function Widget($$anchor) {
	var p = root();

	$.append($$anchor, p);
}