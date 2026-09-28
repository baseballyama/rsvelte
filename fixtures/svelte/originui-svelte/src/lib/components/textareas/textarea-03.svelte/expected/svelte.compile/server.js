import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

export default function Textarea_03($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Textarea with helper text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Textarea($$renderer, { id: uid, placeholder: 'Leave a comment' });
	$$renderer.push(`<!----> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Please add as many details as you can</p></div>`);
}