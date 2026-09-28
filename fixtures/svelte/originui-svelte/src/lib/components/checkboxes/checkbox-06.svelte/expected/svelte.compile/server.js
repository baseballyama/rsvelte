import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_06($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="flex items-center gap-2">`);

	Checkbox($$renderer, {
		id: uid,
		class: 'rounded-full data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500',
		checked: true
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: uid,
		class: 'peer-data-[state=checked]:line-throgh after:bg-muted-foreground peer-data-[state=checked]:text-muted-foreground relative after:absolute after:top-1/2 after:left-0 after:h-px after:w-full after:origin-bottom after:-translate-y-1/2 after:scale-x-0 after:transition-transform after:ease-in-out peer-data-[state=checked]:after:origin-bottom peer-data-[state=checked]:after:scale-x-100',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Fancy todo item`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}