import * as $ from 'svelte/internal/server';
import ToolsCarousel from '$lib/components/global/ToolsCarousel.svelte';
import { SUB_NAV } from '$lib/constants/nav';
import { site } from '$lib/constants/site';

export default function HomepageCarousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="carousel-layout svelte-t7e5aa"><section class="hero svelte-t7e5aa"><h1 class="title svelte-t7e5aa">${$.escape(site.title)}</h1> <p class="subtitle svelte-t7e5aa">${$.escape(site.heroDescription)}</p> <div class="search-cta svelte-t7e5aa"><kbd class="svelte-t7e5aa">⌘</kbd> <kbd class="svelte-t7e5aa">K</kbd> <span class="svelte-t7e5aa">to search</span></div></section> `);

		ToolsCarousel($$renderer, {
			sections: SUB_NAV,
			speedBase: 36,
			gap: 'var(--spacing-sm)',
			pauseOnHover: true,
			reverseAlternate: true
		});

		$$renderer.push(`<!----></div>`);
	});
}