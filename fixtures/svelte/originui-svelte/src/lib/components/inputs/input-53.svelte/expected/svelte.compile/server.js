import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Input_53($$renderer) {
	$$renderer.push(`<div class="*:not-first:mt-2">`);

	Label($$renderer, {
		for: 'input-52',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Read-only input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		id: 'input-52',
		class: 'read-only:bg-muted',
		value: 'This is a read-only input',
		readonly: true,
		placeholder: 'Email',
		type: 'email'
	});

	$$renderer.push(`<!----></div>`);
}