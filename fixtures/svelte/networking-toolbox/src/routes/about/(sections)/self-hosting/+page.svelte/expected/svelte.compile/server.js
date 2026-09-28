import * as $ from 'svelte/internal/server';
import SelfHostingSection from '$lib/components/page-specific/about/SelfHostingSection.svelte';

export default function _page($$renderer) {
	SelfHostingSection($$renderer, {});
}