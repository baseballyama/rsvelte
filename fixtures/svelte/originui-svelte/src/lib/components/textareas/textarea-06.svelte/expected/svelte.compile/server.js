import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';

export default function Textarea_06($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="space-y-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Textarea with error`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Textarea($$renderer, {
		id: uid,
		class: 'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/30',
		placeholder: 'Leave a comment',
		value: 'Hello!'
	});

	$$renderer.push(`<!----> <p class="text-destructive mt-2 text-xs" role="alert" aria-live="polite">Message should be at least 10 characters</p></div>`);
}