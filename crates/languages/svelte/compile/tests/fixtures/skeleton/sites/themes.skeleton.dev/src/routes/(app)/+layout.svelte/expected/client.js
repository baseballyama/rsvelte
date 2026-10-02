import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AppFooter from '$lib/components/common/AppFooter/AppFooter.svelte';
import AppHeader from '$lib/components/common/AppHeader/AppHeader.svelte';

var root = $.from_html(`<main class="h-screen grid grid-rows-[auto_1fr_auto] gap-10"><!> <section class="container mx-auto p-4"><!></section> <!></main>`);

export default function _layout($$anchor, $$props) {
	var // Components (common)
	main = root();

	var node = $.child(main);

	AppHeader(node, {});

	var section = $.sibling(node, 2);
	var node_1 = $.child(section);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(section);

	var node_2 = $.sibling(section, 2);

	AppFooter(node_2, {});
	$.reset(main);
	$.append($$anchor, main);
}