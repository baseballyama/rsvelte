import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DeployingSection from '$lib/components/page-specific/about/DeployingSection.svelte';

export default function _page($$anchor) {
	DeployingSection($$anchor, {});
}