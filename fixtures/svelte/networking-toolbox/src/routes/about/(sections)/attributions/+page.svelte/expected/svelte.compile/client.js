import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AttributionsSection from '$lib/components/page-specific/about/AttributionsSection.svelte';

export default function _page($$anchor) {
	AttributionsSection($$anchor, {});
}