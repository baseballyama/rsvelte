import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HomepageBookmarks from '$lib/components/home/HomepageBookmarks.svelte';

export default function _page($$anchor) {
	HomepageBookmarks($$anchor, {});
}