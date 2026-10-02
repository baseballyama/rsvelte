import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Printer from '@lucide/svelte/icons/printer';

export default function Button_16($$renderer) {
	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			Printer($$renderer, { class: '-ms-1 opacity-60', size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----> Print <kbd class="bg-background text-muted-foreground/70 ms-1 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘P</kbd>`);
		},
		$$slots: { default: true }
	});
}