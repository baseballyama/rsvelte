import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AuthorSection from '$lib/components/page-specific/about/AuthorSection.svelte';

export default function _page($$anchor) {
	AuthorSection($$anchor, { longMode: true });
}