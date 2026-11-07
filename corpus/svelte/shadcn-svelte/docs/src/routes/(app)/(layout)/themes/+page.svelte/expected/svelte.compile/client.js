import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CardsDemo from "$lib/components/cards/cards-demo.svelte";
import ThemeCustomizer from "$lib/components/theme-customizer.svelte";

var root = $.from_html(`<div id="themes" class="container-wrapper scroll-mt-20"><div class="container flex items-center justify-between gap-8 px-6 py-4 md:px-8"><!></div></div> <div class="container-wrapper flex flex-1 flex-col section-soft pb-6"><div class="container flex flex-1 flex-col theme-container"><!></div></div>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	ThemeCustomizer(node, {});
	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var div_3 = $.child(div_2);
	var node_1 = $.child(div_3);

	CardsDemo(node_1, {});
	$.reset(div_3);
	$.reset(div_2);
	$.append($$anchor, fragment);
}