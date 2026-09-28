import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RandomIP from '$lib/components/tools/RandomIP.svelte';

var root = $.from_html(`<div class="page-container"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	RandomIP(node, {});
	$.reset(div);
	$.append($$anchor, div);
}