import * as $ from 'svelte/internal/server';
import { interpolateRgb, interpolateLab, interpolateHclLong } from 'd3-interpolate';
import * as d3chromatic from 'd3-scale-chromatic';
import { ColorRamp } from 'layerchart';
import { entries } from '@layerstack/utils';

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let width = '100%';
		let height = 20;
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

		$$renderer.push(`<div class="grid gap-4 h-100 overflow-auto pr-2"><!--[-->`);

		const each_array = $.ensure_array_like(interpolators);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [name, interpolator] = each_array[$$index];

			$$renderer.push(`<div><div class="text-sm">${$.escape(name)}</div> <svg${$.attr('width', width)}${$.attr('height', height)}>`);
			ColorRamp($$renderer, { interpolator, width, height });
			$$renderer.push(`<!----></svg></div>`);
		}

		$$renderer.push(`<!--]--> <div class="h-1"></div></div>`);
	});
}