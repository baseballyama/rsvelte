import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

export default function Textarea_01($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Simple textarea`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Textarea($$renderer, { id: uid, placeholder: 'Leave a comment' });
	$$renderer.push(`<!----></div>`);
}