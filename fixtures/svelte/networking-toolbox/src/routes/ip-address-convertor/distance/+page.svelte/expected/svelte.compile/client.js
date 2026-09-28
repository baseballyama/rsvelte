import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IPDistance from '$lib/components/tools/IPDistance.svelte';

var root = $.from_html(`<div class="page-container"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	IPDistance(node, {});
	$.reset(div);
	$.append($$anchor, div);
}