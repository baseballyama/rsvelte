import * as $ from 'svelte/internal/server';
import BuildingSection from '$lib/components/page-specific/about/BuildingSection.svelte';

export default function _page($$renderer) {
	BuildingSection($$renderer, {});
}