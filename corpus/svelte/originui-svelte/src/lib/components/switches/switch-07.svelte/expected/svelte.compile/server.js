import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_07($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="inline-flex items-center gap-2">`);

	Switch($$renderer, {
		id: uid,
		class: 'data-[state=unchecked]:border-input data-[state=unchecked]:[&_span]:bg-input data-[state=unchecked]:bg-transparent [&_span]:transition-all data-[state=unchecked]:[&_span]:size-4 data-[state=unchecked]:[&_span]:translate-x-0.5 data-[state=unchecked]:[&_span]:shadow-none data-[state=unchecked]:[&_span]:rtl:-translate-x-0.5'
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->M3-style switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}