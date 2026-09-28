import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Footer from '$lib/components/layout/footer.svelte';
import Header from '$lib/components/layout/header.svelte';

var root = $.from_html(`<div class="grid grid-rows-[auto_1fr_auto] grid-cols-1 min-h-dvh"><!> <main class="container mx-auto border-l border-r border-surface-200-800"><!></main> <!></div>`);

export default function _layout($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	Header(node, {});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	$.snippet(node_1, () => $$props.children);
	$.reset(main);

	var node_2 = $.sibling(main, 2);

	Footer(node_2, {});
	$.reset(div);
	$.append($$anchor, div);
}