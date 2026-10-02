import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_06($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="inline-flex items-center gap-2">`);

	Switch($$renderer, {
		id: uid,
		class: '[&_span]:border-input h-3 w-9 border-none [&_span]:border'
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->M2-style switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}