import * as $ from 'svelte/internal/server';
import AppHeader from '$lib/components/common/AppHeader/AppHeader.svelte';

export default function _layout($$renderer, $$props) {
	// Components (common)
	let { children } = $$props;

	$$renderer.push(`<main class="h-screen grid grid-rows-[auto_1fr_auto] overflow-hidden">`);
	AppHeader($$renderer, {});
	$$renderer.push(`<!----> `);
	children?.($$renderer);
	$$renderer.push(`<!----></main>`);
}