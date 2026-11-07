import * as $ from 'svelte/internal/server';
import FavoritesPage from '$lib/components/docs/pages/FavoritesPage.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="category-page">`);
	FavoritesPage($$renderer, {});
	$$renderer.push(`<!----></div>`);
}