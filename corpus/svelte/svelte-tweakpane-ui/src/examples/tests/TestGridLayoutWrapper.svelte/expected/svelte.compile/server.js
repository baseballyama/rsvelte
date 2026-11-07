import * as $ from 'svelte/internal/server';
import { Checkbox, Slider } from '$lib';

export default function TestGridLayoutWrapper($$renderer) {
	let colors = 0.95;
	let darkMode = true;
	let numbers = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="grid-wrapper svelte-2vxm84">`);

		Slider($$renderer, {
			label: 'Colors',
			max: 1,
			min: 0,
			theme: { baseBorderRadius: '0', bladeValueWidth: '244px' },
			get value() {
				return colors;
			},

			set value($$value) {
				colors = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			label: 'Dark Mode',
			theme: { baseBorderRadius: '0', bladeValueWidth: '75.5px' },
			get value() {
				return darkMode;
			},

			set value($$value) {
				darkMode = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Checkbox($$renderer, {
			label: 'Numbers',
			theme: { baseBorderRadius: '0', bladeValueWidth: '80px' },
			get value() {
				return numbers;
			},

			set value($$value) {
				numbers = $$value;
				$$settled = false;
			}
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