import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";

export default function One($$renderer) {
	$$renderer.push(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="py-12"><div class="mx-auto max-w-5xl px-6"><div class="space-y-6 text-center"><h2 class="text-3xl font-semibold text-balance text-foreground lg:text-4xl">Build 10x Faster with Mist</h2> <div class="flex justify-center gap-3">`);

	Button($$renderer, {
		variant: 'mdefault',
		href: '/',
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/',
		variant: 'outline',
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get a Demo`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></div></section>`);
}