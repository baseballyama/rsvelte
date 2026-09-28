import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BuildingSection from '$lib/components/page-specific/about/BuildingSection.svelte';

export default function _page($$anchor) {
	BuildingSection($$anchor, {});
}