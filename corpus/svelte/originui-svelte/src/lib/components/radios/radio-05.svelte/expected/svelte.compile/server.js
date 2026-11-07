import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_05($$renderer) {
	let selectedValue = 'without-expansion';
	let inputElement = null;

	const handleTransitionEnd = () => {
		if (selectedValue === 'with-expansion' && inputElement) {
			inputElement.focus();
		}
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RadioGroup($$renderer, {
			class: 'gap-6',
			get value() {
				return selectedValue;
			},

			set value($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div><div class="flex items-start gap-2">`);

				RadioGroupItem($$renderer, {
					value: 'with-expansion',
					id: 'radio-05-with-expansion',
					'aria-describedby': 'radio-05-with-expansion-description',
					'aria-controls': 'radio-input-05'
				});

				$$renderer.push(`<!----> <div class="grow"><div class="grid grow gap-2">`);

				Label($$renderer, {
					for: 'radio-05-with-expansion',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Radio with expansion`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p id="radio-05-with-expansion-description" class="text-muted-foreground text-xs">You can use this radio with a label and a description.</p></div> <div role="region" id="radio-input-05" aria-labelledby="radio-05-with-expansion" class="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"${$.attr('data-state', selectedValue === 'with-expansion' ? 'expanded' : 'collapsed')}><div class="-m-2 overflow-hidden p-2"><div class="mt-3">`);

				Input($$renderer, {
					type: 'text',
					id: 'radio-05-additional-info',
					placeholder: 'Enter details',
					'aria-label': 'Additional Information',
					disabled: selectedValue !== 'with-expansion',
					get ref() {
						return inputElement;
					},

					set ref($$value) {
						inputElement = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div></div></div></div></div></div> <div class="flex items-start gap-2">`);

				RadioGroupItem($$renderer, {
					value: 'without-expansion',
					id: 'radio-05-without-expansion',
					'aria-describedby': 'radio-05-without-expansion-description'
				});

				$$renderer.push(`<!----> <div class="grid grow gap-2">`);

				Label($$renderer, {
					for: 'radio-05-without-expansion',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Radio without expansion`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p id="radio-05-without-expansion-description" class="text-muted-foreground text-xs">You can use this checkbox with a label and a description.</p></div></div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}