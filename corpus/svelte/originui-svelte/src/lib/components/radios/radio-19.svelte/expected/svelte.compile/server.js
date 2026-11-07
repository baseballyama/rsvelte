import * as $ from 'svelte/internal/server';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

export default function Radio_19($$renderer) {
	let selectedValue = 'on';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="bg-input/50 inline-flex h-9 rounded-lg p-0.5">`);

		RadioGroup($$renderer, {
			class: 'group after:bg-background after:ring-offset-background has-focus-visible:after:ring-ring relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-xs after:shadow-black/[.04] after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-2 has-focus-visible:after:ring-offset-2 data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full',
			'data-state': selectedValue,
			get value() {
				return selectedValue;
			},

			set value($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<label class="group-data-[state=on]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap">Bill Monthly `);
				RadioGroupItem($$renderer, { value: 'off', class: 'sr-only' });
				$$renderer.push(`<!----></label> <label class="group-data-[state=off]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap"><span>Bill Yearly <span class="group-data-[state=on]:text-emerald-500">-20%</span></span> `);
				RadioGroupItem($$renderer, { value: 'on', class: 'sr-only' });
				$$renderer.push(`<!----></label>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}