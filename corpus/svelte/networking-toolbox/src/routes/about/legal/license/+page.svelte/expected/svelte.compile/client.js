import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LicenseSection from '$lib/components/page-specific/about/LicenseSection.svelte';

export default function _page($$anchor) {
	LicenseSection($$anchor, { longMode: true });
}