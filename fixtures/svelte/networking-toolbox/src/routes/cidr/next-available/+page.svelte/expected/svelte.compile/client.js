import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NextAvailable from '$lib/components/tools/NextAvailable.svelte';

var root = $.from_html(`<div class="page-container"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	NextAvailable(node, {});
	$.reset(div);
	$.append($$anchor, div);
}