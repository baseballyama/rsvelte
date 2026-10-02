import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NthIP from '$lib/components/tools/NthIP.svelte';

var root = $.from_html(`<div class="page-container"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	NthIP(node, {});
	$.reset(div);
	$.append($$anchor, div);
}