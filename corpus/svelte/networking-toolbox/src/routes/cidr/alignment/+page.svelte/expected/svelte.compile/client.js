import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CIDRAlignment from '$lib/components/tools/CIDRAlignment.svelte';

var root = $.from_html(`<div class="page-container"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	CIDRAlignment(node, {});
	$.reset(div);
	$.append($$anchor, div);
}