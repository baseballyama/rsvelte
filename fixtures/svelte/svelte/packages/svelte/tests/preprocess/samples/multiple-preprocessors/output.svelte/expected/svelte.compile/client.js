import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>three</p>`);

export default function Output($$anchor) {
	console.log('script');

	var p = root();

	$.append($$anchor, p);
}