import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_05($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="*:not-first:mt-2"${$.attr_style('', { '--ring': '234 89% 74%' })}>`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input with colored border and ring`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: uid, placeholder: 'Email', type: 'email' });
	$$renderer.push(`<!----></div>`);
}