import * as $ from 'svelte/internal/server';
import { interpolateRgb, interpolateLab, interpolateHclLong } from 'd3-interpolate';
import * as d3chromatic from 'd3-scale-chromatic';
import StepsControl from '$lib/components/controls/ColorRampControls.svelte';
import { ColorRamp } from 'layerchart';
import { entries } from '@layerstack/utils';

export default function Pixelated($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let width = '100%';
		let height = 20;
		let steps = 5;
		const interpolators = entries(d3chromatic).filter(([key]) => key.startsWith('interpolate'));

		interpolators.push([
			`interpolateRgb('red', 'blue')`,
			interpolateRgb('red', 'blue')
		]);

		interpolators.push([
			`interpolateLab('red', 'blue')`,
			interpolateLab('red', 'blue')
		]);

		interpolators.push([
			`interpolateHclLong('red', 'blue')`,
			interpolateHclLong('red', 'blue')
		]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			StepsControl($$renderer, {
				get steps() {
					return steps;
				},

				set steps($$value) {
					steps = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid gap-4 h-100 overflow-auto pr-2"><!--[-->`);

			const each_array = $.ensure_array_like(interpolators);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [name, interpolator] = each_array[$$index];

				$$renderer.push(`<div><div class="text-sm">${$.escape(name)}</div> <svg${$.attr('width', width)}${$.attr('height', height)}>`);

				ColorRamp($$renderer, {
					interpolator,
					width,
					height,
					steps,
					class: '[image-rendering:pixelated]'
				});

				$$renderer.push(`<!----></svg></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}