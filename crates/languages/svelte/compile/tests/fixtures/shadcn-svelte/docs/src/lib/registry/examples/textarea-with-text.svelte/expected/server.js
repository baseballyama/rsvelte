import * as $ from 'svelte/internal/server';
import { Label } from "$lib/registry/ui/label/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Textarea_with_text($$renderer) {
	$$renderer.push(`<div class="grid w-full gap-1.5">`);

	Label($$renderer, {
		for: 'message-2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your Message`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Textarea($$renderer, { placeholder: 'Type your message here.', id: 'message-2' });
	$$renderer.push(`<!----> <p class="text-sm text-muted-foreground">Your message will be copied to the support team.</p></div>`);
}