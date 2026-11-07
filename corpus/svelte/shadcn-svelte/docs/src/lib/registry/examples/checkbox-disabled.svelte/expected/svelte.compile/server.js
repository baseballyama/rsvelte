import * as $ from 'svelte/internal/server';
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Checkbox_disabled($$renderer) {
	$$renderer.push(`<div class="flex items-center space-x-2">`);
	Checkbox($$renderer, { id: 'terms', disabled: true });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'terms2',
		class: 'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-data-[disabled=true]:cursor-not-allowed peer-data-[disabled=true]:opacity-70',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Accept terms and conditions`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}