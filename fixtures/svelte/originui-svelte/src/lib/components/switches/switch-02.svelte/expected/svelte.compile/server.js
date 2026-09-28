import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_02($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="inline-flex items-center gap-2">`);

	Switch($$renderer, {
		id: uid,
		class: 'h-5 w-8 [&_span]:size-4 data-[state=checked]:[&_span]:translate-x-3 data-[state=checked]:[&_span]:rtl:-translate-x-3'
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}