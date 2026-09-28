import * as $ from 'svelte/internal/server';
import { SOCIAL_LINKS } from '$lib/constants';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<main class="flex h-dvh flex-col items-center justify-center gap-10"><div class="flex items-end gap-6"><svg class="h-24 w-24 shrink-0" inline-src="svelte-put" height="96" width="96"></svg> <h1 class="font-fingerpaint text-gradient-brand text-4xl tracking-wide">svelte-put</h1></div> <p>Useful <a class="c-link" href="https://svelte.dev">svelte</a> stuff to put in your projects</p> <div class="flex items-center justify-between gap-10 text-sm uppercase"><a class="c-link-preserved text-link" href="/docs">Read Docs</a> <a class="c-link-preserved text-link"${$.attr('href', SOCIAL_LINKS.GITHUB)} data-external="">See Github</a></div></main>`);
	});
}