import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";

export default function Two($$renderer) {
	$$renderer.push(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="py-12"><div class="mx-auto max-w-5xl px-6"><div class="flex flex-wrap items-center justify-between gap-6"><div><h2 class="text-3xl font-semibold text-balance text-foreground lg:text-4xl">Build 10x Faster with Mist</h2></div> <div class="flex justify-end gap-3">`);

	Button($$renderer, {
		href: '/',
		variant: 'outline',
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get a Demo`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/',
		size: 'lg',
		variant: 'mdefault',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></div></section>`);
}