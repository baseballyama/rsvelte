import * as $ from 'svelte/internal/server';
import HomepageBookmarks from '$lib/components/home/HomepageBookmarks.svelte';

export default function _page($$renderer) {
	HomepageBookmarks($$renderer, {});
}