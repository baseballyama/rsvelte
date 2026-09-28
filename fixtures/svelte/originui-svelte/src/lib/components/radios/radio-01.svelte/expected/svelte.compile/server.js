import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_01($$renderer) {
	RadioGroup($$renderer, {
		value: 'r1',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-2">`);
			RadioGroupItem($$renderer, { value: 'r1', id: 'radio-01-r1' });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'radio-01-r1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Option 1`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
			RadioGroupItem($$renderer, { value: 'r2', id: 'radio-01-r2' });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'radio-01-r2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Option 2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);
			RadioGroupItem($$renderer, { value: 'r3', id: 'radio-01-r3' });
			$$renderer.push(`<!----> `);

			Label($$renderer, {
				for: 'radio-01-r3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Option 3`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}