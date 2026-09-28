import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

export default function Slider_25($$renderer) {
	const defaultValue = 0;
	const min = -10;
	const max = 10;
	let value = { x: -2, y: 4, z: 2 };

	function reset() {
		value.x = defaultValue;
		value.y = defaultValue;
		value.z = defaultValue;
	}

	function handleInputChange(e, key) {
		value[key] = parseFloat(e.currentTarget.value) || 0;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-4"><legend class="text-foreground text-sm font-medium">Object position</legend> <div class="space-y-2"><div class="flex items-center gap-4">`);

		Label($$renderer, {
			class: 'text-muted-foreground text-xs',
			children: ($$renderer) => {
				$$renderer.push(`<!---->X`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Slider($$renderer, {
			type: 'single',
			class: 'grow *:data-slider-thumb:rounded',
			min: -10,
			max: 10,
			'aria-label': 'X',
			get value() {
				return value.x;
			},

			set value($$value) {
				value.x = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			class: 'h-8 w-12 [appearance:textfield] px-2 py-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
			type: 'number',
			inputmode: 'decimal',
			onchange: (e) => handleInputChange(e, 'x'),
			min,
			max,
			value: value.x,
			'aria-label': 'Enter value'
		});

		$$renderer.push(`<!----></div> <div class="flex items-center gap-4">`);

		Label($$renderer, {
			class: 'text-muted-foreground text-xs',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Y`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Slider($$renderer, {
			type: 'single',
			class: 'grow *:data-slider-thumb:rounded',
			min: -10,
			max: 10,
			'aria-label': 'Y',
			get value() {
				return value.y;
			},

			set value($$value) {
				value.y = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			class: 'h-8 w-12 [appearance:textfield] px-2 py-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
			type: 'number',
			inputmode: 'decimal',
			onchange: (e) => handleInputChange(e, 'y'),
			min,
			max,
			value: value.y,
			'aria-label': 'Enter value'
		});

		$$renderer.push(`<!----></div> <div class="flex items-center gap-4">`);

		Label($$renderer, {
			class: 'text-muted-foreground text-xs',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Z`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Slider($$renderer, {
			type: 'single',
			class: 'grow *:data-slider-thumb:rounded',
			min: -10,
			max: 10,
			'aria-label': 'Z',
			get value() {
				return value.z;
			},

			set value($$value) {
				value.z = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			class: 'h-8 w-12 [appearance:textfield] px-2 py-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
			type: 'number',
			inputmode: 'decimal',
			onchange: (e) => handleInputChange(e, 'z'),
			min,
			max,
			value: value.z,
			'aria-label': 'Enter value'
		});

		$$renderer.push(`<!----></div></div> `);

		Button($$renderer, {
			class: 'w-full',
			variant: 'outline',
			onclick: reset,
			children: ($$renderer) => {
				RotateCcw($$renderer, {
					class: '-ms-1 me-2 opacity-60',
					size: 16,
					'aria-hidden': 'true'
				});

				$$renderer.push(`<!----> Reset`);
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