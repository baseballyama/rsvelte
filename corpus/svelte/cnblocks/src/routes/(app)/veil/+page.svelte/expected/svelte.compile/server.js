import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import { seoMetaTags } from "$lib/config/seo";
import { MetaTags } from "svelte-meta-tags";

export default function _page($$renderer) {
	MetaTags($$renderer, $.spread_props([seoMetaTags, { title: 'Veil Blocks' }]));
	$$renderer.push(`<!----> <section><div class="mx-4 max-w-7xl border-x border-b px-8 py-16 [--color-border:color-mix(in_oklab,var(--color-zinc-200)_75%,transparent)] md:mx-auto dark:[--color-border:color-mix(in_oklab,var(--color-zinc-800)_60%,transparent)]"><div class="max-w-2xl"><h1 class="text-3xl font-bold text-balance sm:text-4xl">Veil Blocks</h1> <p class="mt-3 mb-6 text-base text-muted-foreground">Modern marketing and UI blocks for Svelte, designed with the Veil visual style.</p> <div class="flex flex-wrap items-center gap-2 sm:space-x-2">`);

	Button($$renderer, {
		href: '/veil/hero',
		class: 'w-full sm:w-fit',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/docs/installation',
		variant: 'outline',
		class: 'w-full sm:w-fit',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Visit Docs`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></section>`);
}