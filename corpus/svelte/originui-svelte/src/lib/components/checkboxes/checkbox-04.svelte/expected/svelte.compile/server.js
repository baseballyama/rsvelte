import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_04($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="flex items-center gap-2">`);
	Checkbox($$renderer, { id: uid, disabled: true });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled checkbox`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}