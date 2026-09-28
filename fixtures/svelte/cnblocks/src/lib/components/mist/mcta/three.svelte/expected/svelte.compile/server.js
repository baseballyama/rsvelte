import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Calendar from "@lucide/svelte/icons/calendar";

export default function Three($$renderer) {
	$$renderer.push(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="bg-muted/50 py-12 dark:bg-muted/30"><div class="mx-auto max-w-5xl px-6"><h2 class="max-w-lg text-3xl font-semibold text-balance text-foreground lg:text-4xl"><span class="text-muted-foreground">Build Modern Websites.</span> Drive Results</h2> <p class="mt-4 text-lg">Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.</p> <div class="mt-8 flex gap-3">`);

	Button($$renderer, {
		variant: 'mdefault',
		href: '/',
		class: 'pr-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Try Mist for Free `);
			ChevronRight($$renderer, { strokeWidth: 2.5, class: 'size-3.5! opacity-50' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		href: '/',
		variant: 'outline',
		class: 'pl-2.5',
		children: ($$renderer) => {
			Calendar($$renderer, { class: '!size-3.5 opacity-50', strokeWidth: 2.5 });
			$$renderer.push(`<!----> Request a Demo`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div></section>`);
}