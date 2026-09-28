import * as $ from 'svelte/internal/server';
import { CircleLegend } from 'layerchart';
import { scaleSqrt } from 'd3-scale';

export default function Label_placement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const scale = scaleSqrt([0, 1_000_000], [0, 50]);

		$$renderer.push(`<div class="grid gap-6">`);

		CircleLegend($$renderer, {
			scale,
			title: 'Population',
			tickFormat: 'metric',
			labelPlacement: 'right'
		});

		$$renderer.push(`<!----> `);

		CircleLegend($$renderer, {
			scale,
			title: 'Population',
			tickFormat: 'metric',
			labelPlacement: 'left'
		});

		$$renderer.push(`<!----> `);

		CircleLegend($$renderer, {
			scale,
			title: 'Population',
			tickFormat: 'metric',
			labelPlacement: 'inline'
		});

		$$renderer.push(`<!----></div>`);
	});
}