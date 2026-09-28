import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_10($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="flex items-start gap-2">`);
	Checkbox($$renderer, { id: uid, 'aria-describedby': `${uid}-description` });
	$$renderer.push(`<!----> <div class="grid grow gap-2">`);

	Label($$renderer, {
		for: uid,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p${$.attr('id', `${uid}-description`)} class="text-muted-foreground text-xs">You can use this checkbox with a label and a description.</p></div></div>`);
}