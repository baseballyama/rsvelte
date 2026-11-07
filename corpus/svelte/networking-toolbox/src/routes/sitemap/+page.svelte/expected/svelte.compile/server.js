import * as $ from 'svelte/internal/server';
import SiteMapList from '$lib/components/home/SiteMapList.svelte';

export default function _page($$renderer) {
	SiteMapList($$renderer, {});
}