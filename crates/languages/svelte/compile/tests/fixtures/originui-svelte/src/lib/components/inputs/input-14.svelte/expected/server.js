import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_14($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with start add-on`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex rounded-lg shadow-xs shadow-black/5"><span class="border-input bg-background text-muted-foreground inline-flex items-center rounded-s-lg border px-3 text-sm">https://</span> `);

	Input($$renderer, {
		id: uid,
		class: '-ms-px rounded-s-none shadow-none',
		placeholder: 'google.com',
		type: 'text'
	});

	$$renderer.push(`<!----></div></div>`);
}