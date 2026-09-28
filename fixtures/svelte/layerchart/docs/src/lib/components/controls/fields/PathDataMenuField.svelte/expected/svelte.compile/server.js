import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import * as easings from 'svelte/easing';
import { MenuField } from 'svelte-ux';

export default function PathDataMenuField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, amplitude = 1, frequency = 10, phase = 0 } = $$props;

		const mathOptions = $.derived(() => [
			{
				label: 'sin',
				group: 'math',
				value: (x) => amplitude * Math.sin(x * frequency) + phase
			},

			{
				label: 'cos',
				group: 'math',
				value: (x) => amplitude * Math.cos(x * frequency) + phase
			},

			{
				label: 'tan',
				group: 'math',
				value: (x) => amplitude * Math.tan(x * frequency) + phase
			},

			{
				label: 'sqrt',
				group: 'math',
				value: (x) => amplitude * Math.sqrt(x * frequency) + phase
			},

			{
				label: 'ceil',
				group: 'math',
				value: (x) => amplitude * Math.ceil(x * frequency) + phase
			},

			{
				label: 'floor',
				group: 'math',
				value: (x) => amplitude * Math.floor(x * frequency) + phase
			},

			{
				label: 'round',
				group: 'math',
				value: (x) => amplitude * Math.round(x * frequency) + phase
			},

			{
				label: 'random',
				group: 'math',
				value: (x) => amplitude * Math.random() + phase
			},

			{
				label: 'pow',
				group: 'math',
				value: (x) => amplitude * Math.pow(x, frequency) + phase
			}
		]);

		const easingOptions = Object.entries(easings).map(([key, value]) => {
			return { label: key, value, group: 'easing' };
		});

		const options = $.derived(() => [...mathOptions(), ...easingOptions]);

		// Select initial option
		onMount(() => {
			value = options()[0].value;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="screenshot-hidden">`);

			MenuField($$renderer, {
				label: 'Path data',
				options: options(),
				stepper: true,
				classes: { menuIcon: 'hidden' },
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
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
		$.bind_props($$props, { value });
	});
}