import * as $ from 'svelte/internal/server';
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Input_with_label($$renderer) {
	const id = $.props_id($$renderer);

	$$renderer.push(`<div class="flex w-full max-w-sm flex-col gap-1.5">`);

	Label($$renderer, {
		for: `email-${id}`,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { type: 'email', id: `email-${id}`, placeholder: 'Email' });
	$$renderer.push(`<!----></div>`);
}