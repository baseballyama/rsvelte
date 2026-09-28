import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import WildcardMask from '$lib/components/tools/WildcardMask.svelte';

var root = $.from_html(`<div class="page-container"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	WildcardMask(node, {});
	$.reset(div);
	$.append($$anchor, div);
}