import * as $ from 'svelte/internal/server';
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Input_with_text($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-sm flex-col gap-1.5">`);

	Label($$renderer, {
		for: 'email-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { type: 'email', id: 'email-2', placeholder: 'Email' });
	$$renderer.push(`<!----> <p class="text-sm text-muted-foreground">Enter your email address.</p></div>`);
}