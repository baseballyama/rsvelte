import * as $ from 'svelte/internal/server';
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Input_file($$renderer) {
	$$renderer.push(`<div class="grid w-full max-w-sm items-center gap-1.5">`);

	Label($$renderer, {
		for: 'picture',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Picture`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: 'picture', type: 'file' });
	$$renderer.push(`<!----></div>`);
}