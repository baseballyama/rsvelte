import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToolsCarousel from '$lib/components/global/ToolsCarousel.svelte';
import { SUB_NAV } from '$lib/constants/nav';
import { site } from '$lib/constants/site';

var root = $.from_html(`<div class="carousel-layout svelte-t7e5aa"><section class="hero svelte-t7e5aa"><h1 class="title svelte-t7e5aa"> </h1> <p class="subtitle svelte-t7e5aa"> </p> <div class="search-cta svelte-t7e5aa"><kbd class="svelte-t7e5aa">⌘</kbd> <kbd class="svelte-t7e5aa">K</kbd> <span class="svelte-t7e5aa">to search</span></div></section> <!></div>`);

export default function HomepageCarousel($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var section = $.child(div);
	var h1 = $.child(section);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.next(2);
	$.reset(section);

	var node = $.sibling(section, 2);

	ToolsCarousel(node, {
		get sections() {
			return SUB_NAV;
		},
		speedBase: 36,
		gap: 'var(--spacing-sm)',
		pauseOnHover: true,
		reverseAlternate: true
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, site.title);
		$.set_text(text_1, site.heroDescription);
	});

	$.append($$anchor, div);
	$.pop();
}