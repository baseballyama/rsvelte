import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button";
import { LightSwitch } from "$lib/components/ui/light-switch";

export default function _page($$renderer) {
	$$renderer.push(`<header class="sticky top-0 flex w-full items-center justify-end p-4">`);
	LightSwitch($$renderer, { variant: 'outline', size: 'icon' });
	$$renderer.push(`<!----></header> <main class="flex h-screen flex-col place-items-center justify-center gap-2"><h1 class="text-4xl font-bold">shadcn-svelte repro template</h1> <p class="text-muted-foreground">Import and use components here to create a minimal reproduction of your issue.</p> `);

	Button($$renderer, {
		variant: 'outline',
		href: 'https://github.com/huntabyte/shadcn-svelte',
		children: ($$renderer) => {
			$$renderer.push(`<!---->GitHub`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></main>`);
}