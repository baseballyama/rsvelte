import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_08($$renderer) {
	RadioGroup($$renderer, {
		class: 'gap-2',
		value: 'r1',
		children: ($$renderer) => {
			$$renderer.push(`<div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]">`);

			RadioGroupItem($$renderer, {
				value: 'r1',
				id: 'radio-08-r1',
				'aria-describedby': 'radio-08-r1-description',
				class: 'order-1 after:absolute after:inset-0'
			});

			$$renderer.push(`<!----> <div class="grid grow gap-2">`);

			Label($$renderer, {
				for: 'radio-08-r1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p id="radio-08-r1-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div> <div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]">`);

			RadioGroupItem($$renderer, {
				value: 'r2',
				id: 'radio-08-r2',
				'aria-describedby': 'radio-08-r2-description',
				class: 'order-1 after:absolute after:inset-0'
			});

			$$renderer.push(`<!----> <div class="grid grow gap-2">`);

			Label($$renderer, {
				for: 'radio-08-r2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p id="radio-08-r2-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div>`);
		},
		$$slots: { default: true }
	});
}