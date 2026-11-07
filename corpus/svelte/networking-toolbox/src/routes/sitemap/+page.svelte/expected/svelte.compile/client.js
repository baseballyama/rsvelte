import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SiteMapList from '$lib/components/home/SiteMapList.svelte';

export default function _page($$anchor) {
	SiteMapList($$anchor, {});
}