import * as $ from 'svelte/internal/server';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Checkbox_with_text($$renderer) {
	$$renderer.push(`<div class="items-top flex space-x-2">`);
	Checkbox($$renderer, { id: 'terms1' });
	$$renderer.push(`<!----> <div class="grid gap-1.5 leading-none">`);

	Label($$renderer, {
		for: 'terms1',
		class: 'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept terms and conditions`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="text-sm text-muted-foreground">You agree to our Terms of Service and Privacy Policy.</p></div></div>`);
}