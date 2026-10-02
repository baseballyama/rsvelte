import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_07($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="flex items-center gap-2">`);
	Checkbox($$renderer, { id: uid });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->I agree to the <a class="underline" href="https://originui.com" target="_blank" rel="noopener noreferrer">terms of service</a>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}