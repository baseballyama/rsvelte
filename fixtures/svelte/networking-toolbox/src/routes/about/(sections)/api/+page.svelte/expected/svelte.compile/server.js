import * as $ from 'svelte/internal/server';
import ApiSection from '$lib/components/page-specific/about/ApiSection.svelte';

export default function _page($$renderer) {
	ApiSection($$renderer, {});
}