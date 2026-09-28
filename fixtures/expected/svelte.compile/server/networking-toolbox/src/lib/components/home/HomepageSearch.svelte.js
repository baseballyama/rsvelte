import * as $ from 'svelte/internal/server';
import GlobalSearch from '$lib/components/global/GlobalSearch.svelte';
import { site } from '$lib/constants/site';

export default function HomepageSearch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="homepage-search svelte-1197gok"><section class="hero-search svelte-1197gok"><div class="hero-bg svelte-1197gok"></div> <div class="hero-content svelte-1197gok"><h1 class="svelte-1197gok">${$.escape(site.title)}</h1> <p class="hero-text svelte-1197gok">${$.escape(site.heroDescription)}</p></div></section> <div class="search-container svelte-1197gok">`);
		GlobalSearch($$renderer, { embedded: true });
		$$renderer.push(`<!----></div></div>`);
	});
}