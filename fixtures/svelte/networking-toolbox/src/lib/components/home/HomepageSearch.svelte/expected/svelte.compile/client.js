import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GlobalSearch from '$lib/components/global/GlobalSearch.svelte';
import { site } from '$lib/constants/site';

var root = $.from_html(`<div class="homepage-search svelte-1197gok"><section class="hero-search svelte-1197gok"><div class="hero-bg svelte-1197gok"></div> <div class="hero-content svelte-1197gok"><h1 class="svelte-1197gok"> </h1> <p class="hero-text svelte-1197gok"> </p></div></section> <div class="search-container svelte-1197gok"><!></div></div>`);

export default function HomepageSearch($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var section = $.child(div);
	var div_1 = $.sibling($.child(section), 2);
	var h1 = $.child(div_1);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_1);
	$.reset(section);

	var div_2 = $.sibling(section, 2);
	var node = $.child(div_2);

	GlobalSearch(node, { embedded: true });
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, site.title);
		$.set_text(text_1, site.heroDescription);
	});

	$.append($$anchor, div);
	$.pop();
}