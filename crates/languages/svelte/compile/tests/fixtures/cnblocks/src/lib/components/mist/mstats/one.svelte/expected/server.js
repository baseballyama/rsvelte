import * as $ from 'svelte/internal/server';
import Card from "$lib/components/ui/card/card.svelte";

export default function One($$renderer) {
	$$renderer.push(`<section class="bg-muted py-12 md:py-20 dark:[--color-muted:var(--color-zinc-900)]"><div class="mx-auto max-w-5xl px-6">`);

	Card($$renderer, {
		class: 'grid gap-0.5 divide-y *:py-8 *:text-center md:grid-cols-3 md:divide-x md:divide-y-0',
		children: ($$renderer) => {
			$$renderer.push(`<div><div class="space-y-1 text-4xl font-bold text-foreground">+1200</div> <p class="text-muted-foreground">Stars on GitHub</p></div> <div><div class="space-y-1 text-4xl font-bold text-foreground">56%</div> <p class="text-muted-foreground">Conversion rate</p></div> <div><div class="space-y-1 text-4xl font-bold text-foreground">+500</div> <p class="text-muted-foreground">Powered Apps</p></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></section>`);
}