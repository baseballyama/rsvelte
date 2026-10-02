import * as $ from 'svelte/internal/server';
import { Label } from "$lib/registry/ui/label/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Textarea_with_label($$renderer) {
	$$renderer.push(`<div class="grid w-full gap-1.5">`);

	Label($$renderer, {
		for: 'message',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your message`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Textarea($$renderer, { placeholder: 'Type your message here.', id: 'message' });
	$$renderer.push(`<!----></div>`);
}