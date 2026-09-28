import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_13($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]">`);

	Checkbox($$renderer, {
		id: uid,
		class: 'order-1 after:absolute after:inset-0',
		'aria-describedby': `${uid}-description`
	});

	$$renderer.push(`<!----> <div class="grid grow gap-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p${$.attr('id', `${uid}-description`)} class="text-muted-foreground text-xs">A short description goes here.</p></div></div>`);
}