import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Separator_vertical_menu($$renderer) {
	Example($$renderer, {
		title: 'Vertical Menu',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-2 text-sm md:gap-4 style-lyra:text-xs/relaxed"><div class="flex flex-col gap-1"><span class="font-medium">Settings</span> <span class="text-xs text-muted-foreground">Manage preferences</span></div> `);
			Separator($$renderer, { orientation: 'vertical' });
			$$renderer.push(`<!----> <div class="flex flex-col gap-1"><span class="font-medium">Account</span> <span class="text-xs text-muted-foreground">Profile &amp; security</span></div> `);
			Separator($$renderer, { orientation: 'vertical' });
			$$renderer.push(`<!----> <div class="flex flex-col gap-1"><span class="font-medium">Help</span> <span class="text-xs text-muted-foreground">Support &amp; docs</span></div></div>`);
		},
		$$slots: { default: true }
	});
}