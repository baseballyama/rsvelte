import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HomepageSearch from '$lib/components/home/HomepageSearch.svelte';

export default function _page($$anchor) {
	HomepageSearch($$anchor, {});
}