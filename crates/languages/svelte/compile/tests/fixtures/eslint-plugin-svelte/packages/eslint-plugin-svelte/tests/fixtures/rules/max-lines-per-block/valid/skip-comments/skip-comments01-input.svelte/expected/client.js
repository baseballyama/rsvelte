import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-173ofx6"></div>`);

export default function Skip_comments01_input($$anchor) {
	// This is a comment
	/* Another comment */
	let count = 0;

	var div = root();

	div.textContent = '0';
	$.append($$anchor, div);
}