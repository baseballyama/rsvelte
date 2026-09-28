import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<small class="text-sm leading-none font-medium">Email address</small>`);

export default function Typography_small($$anchor) {
	var small = root();

	$.append($$anchor, small);
}