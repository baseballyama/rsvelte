import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelfHostingSection from '$lib/components/page-specific/about/SelfHostingSection.svelte';

export default function _page($$anchor) {
	SelfHostingSection($$anchor, {});
}