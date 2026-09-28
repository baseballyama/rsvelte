import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";

export default function Cta_two($$renderer) {
	$$renderer.push(`<section class="py-16"><div class="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32"><div class="text-center"><h2 class="text-4xl font-semibold text-balance lg:text-5xl">Start Building</h2> <p class="mt-4">Libero sapiente aliquam quibusdam aspernatur.</p> <div class="mt-12 flex flex-wrap justify-center gap-4">`);

	Button($$renderer, {
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Get Started`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'lg',
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Book Demo`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></section>`);
}