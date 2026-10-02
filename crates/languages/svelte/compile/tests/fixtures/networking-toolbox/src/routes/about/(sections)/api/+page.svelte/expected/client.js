import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ApiSection from '$lib/components/page-specific/about/ApiSection.svelte';

export default function _page($$anchor) {
	ApiSection($$anchor, {});
}