import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';

export default function BetaLabel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<span class="flex items-center justify-center rounded-lg bg-yellow px-2 py-0.5"><span class="text-graphite-1000 text-sm font-bold uppercase">${$.escape(s('app.beta'))}</span></span>`);
	});
}