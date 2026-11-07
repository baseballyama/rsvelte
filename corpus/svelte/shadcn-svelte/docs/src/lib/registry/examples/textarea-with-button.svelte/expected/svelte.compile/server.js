import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Textarea_with_button($$renderer) {
	$$renderer.push(`<div class="grid w-full gap-2">`);
	Textarea($$renderer, { placeholder: 'Type your message here.' });
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Send message`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}