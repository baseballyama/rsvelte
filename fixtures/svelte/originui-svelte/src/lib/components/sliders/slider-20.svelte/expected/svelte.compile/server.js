import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import Minus from '@lucide/svelte/icons/minus';
import Plus from '@lucide/svelte/icons/plus';

export default function Slider_20($$renderer) {
	const min = 0;
	const max = 200;
	const steps = 5;
	let value = 100;

	function decrement() {
		value -= steps;
	}

	function increment() {
		value += steps;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="*:not-first:mt-3">`);

		Label($$renderer, {
			class: 'tabular-nums',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(value)} credits/mo`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flex items-center gap-4"><div>`);

		Button($$renderer, {
			variant: 'outline',
			size: 'icon',
			class: 'size-8',
			'aria-label': 'Decrease value',
			disabled: value === min,
			onclick: decrement,
			children: ($$renderer) => {
				Minus($$renderer, { size: 16, 'aria-hidden': 'true' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Slider($$renderer, {
			type: 'single',
			class: 'grow',
			min,
			max,
			step: steps,
			'aria-label': 'Dual range slider with buttons',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div>`);

		Button($$renderer, {
			variant: 'outline',
			size: 'icon',
			class: 'size-8',
			'aria-label': 'Increase value',
			disabled: value === max,
			onclick: increment,
			children: ($$renderer) => {
				Plus($$renderer, { size: 16, 'aria-hidden': 'true' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}