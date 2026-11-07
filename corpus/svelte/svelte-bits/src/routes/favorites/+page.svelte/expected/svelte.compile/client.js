import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FavoritesPage from '$lib/components/docs/pages/FavoritesPage.svelte';

var root = $.from_html(`<div class="category-page"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	FavoritesPage(node, {});
	$.reset(div);
	$.append($$anchor, div);
}