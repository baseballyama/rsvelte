import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_05($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="inline-flex items-center gap-2">`);
	Switch($$renderer, { id: uid, class: 'rounded-md [&_span]:rounded' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Square switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}