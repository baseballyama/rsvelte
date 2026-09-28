import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_03($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="inline-flex items-center gap-2"${$.attr_style('', {
		'--primary': '238.7 83.5% 66.7%',
		'--ring': '238.7 83.5% 66.7%'
	})}>`);

	Switch($$renderer, { id: uid, checked: true });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}