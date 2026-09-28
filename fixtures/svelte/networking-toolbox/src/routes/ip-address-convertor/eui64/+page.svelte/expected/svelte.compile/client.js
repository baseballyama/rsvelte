import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EUI64 from '$lib/components/tools/EUI64.svelte';

var root = $.from_html(`<div class="page-container"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	EUI64(node, {});
	$.reset(div);
	$.append($$anchor, div);
}