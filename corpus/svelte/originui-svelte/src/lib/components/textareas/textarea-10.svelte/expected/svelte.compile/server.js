import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

export default function Textarea_10($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Textarea with left button`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Textarea($$renderer, { id: uid, placeholder: 'Leave a comment' });
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Send`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}