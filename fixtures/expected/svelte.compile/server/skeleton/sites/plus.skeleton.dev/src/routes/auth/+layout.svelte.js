import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import AuthCarousel from '$lib/components/auth/auth-carousel.svelte';
import Skeleton from '$lib/components/branding/skeleton.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$$renderer.push(`<div class="grid min-h-screen grid-cols-1 lg:grid-cols-2"><section class="preset-filled-surface-100-900 flex flex-col p-6 lg:p-10"><a href="/" class="inline-flex items-center gap-2 self-start" aria-label="Homepage" title="Homepage">`);
		Skeleton($$renderer, { class: 'size-elem-3xl' });
		$$renderer.push(`<!----> <span class="text-sm font-medium">Skeleton Plus</span></a> <div class="flex flex-1 items-center justify-center"><div class="w-full max-w-sm">`);
		children($$renderer);
		$$renderer.push(`<!----></div></div> <footer class="flex items-center justify-between text-xs opacity-60"><p>By <a href="https://www.skeletonlabs.co/" target="_blank" class="hover:underline">Skeleton Labs</a></p> <nav class="flex items-center gap-2"><a${$.attr('href', resolve('/legal/terms'))} class="hover:underline">Terms</a> <span class="opacity-60" aria-hidden="true">•</span> <a${$.attr('href', resolve('/legal/privacy'))} class="hover:underline">Privacy</a></nav></footer></section> <aside class="preset-filled-surface-50-950 relative hidden flex-col justify-center items-center p-10 lg:flex">`);
		AuthCarousel($$renderer, {});
		$$renderer.push(`<!----></aside></div>`);
	});
}