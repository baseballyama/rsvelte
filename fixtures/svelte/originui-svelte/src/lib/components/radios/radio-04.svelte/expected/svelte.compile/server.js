import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_04($$renderer) {
	RadioGroup($$renderer, {
		class: 'gap-6',
		value: 'small',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-start gap-2">`);

			RadioGroupItem($$renderer, {
				value: 'small',
				id: 'radio-04-small',
				'aria-describedby': 'radio-04-small-description'
			});

			$$renderer.push(`<!----> <div class="grid grow gap-2">`);

			Label($$renderer, {
				for: 'radio-04-small',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Small <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p id="radio-04-small-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div> <div class="flex items-start gap-2">`);

			RadioGroupItem($$renderer, {
				value: 'r2',
				id: 'radio-04-r2',
				'aria-describedby': 'radio-04-r2-description'
			});

			$$renderer.push(`<!----> <div class="grid grow gap-2">`);

			Label($$renderer, {
				for: 'radio-04-r2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Large <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p id="radio-04-r2-description" class="text-muted-foreground text-xs">You can use this card with a label and a description.</p></div></div>`);
		},
		$$slots: { default: true }
	});
}