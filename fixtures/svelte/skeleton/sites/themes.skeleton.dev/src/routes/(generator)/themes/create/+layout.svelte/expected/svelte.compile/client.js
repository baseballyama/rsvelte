import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AppHeader from '$lib/components/common/AppHeader/AppHeader.svelte';

var root = $.from_html(`<main class="h-screen grid grid-rows-[auto_1fr_auto] overflow-hidden"><!> <!></main>`);

export default function _layout($$anchor, $$props) {
	var // Components (common)
	main = root();

	var node = $.child(main);

	AppHeader(node, {});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(main);
	$.append($$anchor, main);
}