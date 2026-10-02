import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Input_with_button($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-sm items-center gap-2">`);
	Input($$renderer, { type: 'email', placeholder: 'Email' });
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		type: 'submit',
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Subscribe`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}