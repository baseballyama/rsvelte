import * as $ from 'svelte/internal/server';
import { cmdOrCtrl, optionOrAlt } from '$lib/hooks/is-mac.svelte';
import { Kbd } from '$lib/components/ui/kbd';

export default function Is_mac_keys($$renderer) {
	$$renderer.push(`<div class="flex flex-col place-items-center gap-2"><div class="flex flex-col place-items-center gap-2"><span class="text-muted-foreground text-sm">Command/Ctrl</span> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(cmdOrCtrl)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="flex flex-col place-items-center gap-2"><span class="text-muted-foreground text-sm">Option/Alt</span> `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(optionOrAlt)}`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}