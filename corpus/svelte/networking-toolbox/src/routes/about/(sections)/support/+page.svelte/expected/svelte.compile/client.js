import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SupportSection from '$lib/components/page-specific/about/SupportSection.svelte';

export default function _page($$anchor) {
	SupportSection($$anchor, {});
}