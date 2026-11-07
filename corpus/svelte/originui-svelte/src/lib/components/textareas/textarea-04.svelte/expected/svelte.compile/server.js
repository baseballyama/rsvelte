import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

export default function Textarea_04($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="mb-2 flex items-center justify-between gap-1">`);

	Label($$renderer, {
		for: uid,
		class: 'mb-0',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Textarea with hint`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">Optional</span></div> `);
	Textarea($$renderer, { id: uid, placeholder: 'Leave a comment' });
	$$renderer.push(`<!---->`);
}