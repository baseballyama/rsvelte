import * as $ from 'svelte/internal/server';
import AuthorSection from '$lib/components/page-specific/about/AuthorSection.svelte';

export default function _page($$renderer) {
	AuthorSection($$renderer, { longMode: true });
}