import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_05($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="flex items-center gap-2">`);
	Checkbox($$renderer, { id: uid, checked: true });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		class: 'peer-data-[state=checked]:line-through',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Simple todo item`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}