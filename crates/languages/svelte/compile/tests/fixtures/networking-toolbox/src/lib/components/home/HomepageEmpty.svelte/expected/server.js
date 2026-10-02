import * as $ from 'svelte/internal/server';
import { site } from '$lib/constants/site';

export default function HomepageEmpty($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="empty-layout svelte-sqt8g7"><h1 class="svelte-sqt8g7">${$.escape(site.title)}</h1> <div class="search-hint svelte-sqt8g7"><kbd class="svelte-sqt8g7">⌘</kbd> <kbd class="svelte-sqt8g7">K</kbd> <span class="svelte-sqt8g7">to search</span></div></div>`);
	});
}