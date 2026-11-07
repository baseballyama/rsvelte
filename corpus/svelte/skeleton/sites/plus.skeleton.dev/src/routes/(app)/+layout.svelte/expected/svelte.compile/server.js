import * as $ from 'svelte/internal/server';
import Footer from '$lib/components/layout/footer.svelte';
import Header from '$lib/components/layout/header.svelte';

export default function _layout($$renderer, $$props) {
	const { children } = $$props;

	$$renderer.push(`<div class="grid grid-rows-[auto_1fr_auto] grid-cols-1 min-h-dvh">`);
	Header($$renderer, {});
	$$renderer.push(`<!----> <main class="container mx-auto border-l border-r border-surface-200-800">`);
	children($$renderer);
	$$renderer.push(`<!----></main> `);
	Footer($$renderer, {});
	$$renderer.push(`<!----></div>`);
}