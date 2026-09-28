import * as $ from 'svelte/internal/server';
import { CircleLegend } from 'layerchart';
import { scaleLinear, scaleSqrt, scaleLog, scalePow } from 'd3-scale';

export default function Scale_types($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const linear = scaleLinear([0, 1_000_000], [0, 50]);
		const sqrt = scaleSqrt([0, 1_000_000], [0, 50]);
		const log = scaleLog([1, 1_000_000], [4, 50]);
		const pow = scalePow().exponent(0.3).domain([0, 1_000_000]).range([0, 50]);

		$$renderer.push(`<div class="flex flex-wrap gap-4">`);
		CircleLegend($$renderer, { scale: sqrt, title: 'Sqrt', tickFormat: 'metric' });
		$$renderer.push(`<!----> `);
		CircleLegend($$renderer, { scale: linear, title: 'Linear', tickFormat: 'metric' });
		$$renderer.push(`<!----> `);
		CircleLegend($$renderer, { scale: log, title: 'Log', tickFormat: 'metric' });
		$$renderer.push(`<!----> `);
		CircleLegend($$renderer, { scale: pow, title: 'Pow (0.3)', tickFormat: 'metric' });
		$$renderer.push(`<!----></div>`);
	});
}