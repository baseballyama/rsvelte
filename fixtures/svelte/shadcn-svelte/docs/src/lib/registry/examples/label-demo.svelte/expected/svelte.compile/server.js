import * as $ from 'svelte/internal/server';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Label_demo($$renderer) {
	$$renderer.push(`<div><div class="flex items-center space-x-2">`);
	Checkbox($$renderer, { id: 'terms' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'terms',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept terms and conditions`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}