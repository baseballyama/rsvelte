import * as $ from 'svelte/internal/server';
import AppFooter from '$lib/components/common/AppFooter/AppFooter.svelte';
import AppHeader from '$lib/components/common/AppHeader/AppHeader.svelte';

export default function _layout($$renderer, $$props) {
	// Components (common)
	let { children } = $$props;

	$$renderer.push(`<main class="h-screen grid grid-rows-[auto_1fr_auto] gap-10">`);
	AppHeader($$renderer, {});
	$$renderer.push(`<!----> <section class="container mx-auto p-4">`);
	children?.($$renderer);
	$$renderer.push(`<!----></section> `);
	AppFooter($$renderer, {});
	$$renderer.push(`<!----></main>`);
}