import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_03($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="flex items-center gap-2"${$.attr_style('', {
		'--primary': '238.7 83.5% 66.7%',
		'--ring': '238.7 83.5% 66.7%'
	})}>`);

	Checkbox($$renderer, { id: uid, checked: true });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Colored checkbox`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}