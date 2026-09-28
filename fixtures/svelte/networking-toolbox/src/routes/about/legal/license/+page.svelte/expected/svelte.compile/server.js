import * as $ from 'svelte/internal/server';
import LicenseSection from '$lib/components/page-specific/about/LicenseSection.svelte';

export default function _page($$renderer) {
	LicenseSection($$renderer, { longMode: true });
}