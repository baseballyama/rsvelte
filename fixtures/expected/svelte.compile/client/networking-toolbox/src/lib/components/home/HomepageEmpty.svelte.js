import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site } from '$lib/constants/site';

var root = $.from_html(`<div class="empty-layout svelte-sqt8g7"><h1 class="svelte-sqt8g7"> </h1> <div class="search-hint svelte-sqt8g7"><kbd class="svelte-sqt8g7">⌘</kbd> <kbd class="svelte-sqt8g7">K</kbd> <span class="svelte-sqt8g7">to search</span></div></div>`);

export default function HomepageEmpty($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var h1 = $.child(div);
	var text = $.only_child(h1, true);

	$.next(2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, site.title));
	$.append($$anchor, div);
	$.pop();
}