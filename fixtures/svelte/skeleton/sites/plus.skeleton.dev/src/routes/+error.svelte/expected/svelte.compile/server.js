import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Skeleton from '$lib/components/branding/skeleton.svelte';
import Footer from '$lib/components/layout/footer.svelte';
import Header from '$lib/components/layout/header.svelte';
import HomeIcon from '@lucide/svelte/icons/home';
import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="min-h-dvh grid grid-rows-[auto_1fr_auto]">`);
		Header($$renderer, {});
		$$renderer.push(`<!----> <main class="container container-page mx-auto flex w-full items-center justify-center border-x border-surface-200-800"><article class="w-full max-w-xl flex flex-col justify-center items-center gap-4"><header>`);
		Skeleton($$renderer, { class: 'size-elem-7xl' });
		$$renderer.push(`<!----> <h1 class="sr-only">Error</h1></header> <article class="space-y-2 text-center"><p class="opacity-60">Status ${$.escape(page.status)}</p> <h2 class="h3">${$.escape(page.error?.message ?? 'An unknown error occurred.')}</h2></article> <footer class="flex gap-2"><a${$.attr('href', page.url.toString())} class="btn preset-outlined-surface-200-800">`);
		RefreshCwIcon($$renderer, {});
		$$renderer.push(`<!----> <span>Reload Page</span></a> <a href="/" class="btn preset-filled">`);
		HomeIcon($$renderer, {});
		$$renderer.push(`<!----> <span>Go Home</span></a></footer></article></main> `);
		Footer($$renderer, {});
		$$renderer.push(`<!----></div>`);
	});
}