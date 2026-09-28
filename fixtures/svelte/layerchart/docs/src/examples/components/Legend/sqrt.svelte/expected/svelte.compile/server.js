import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleSqrt } from 'd3-scale';

export default function Sqrt($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleSqrt([-100, 0, 100], ['blue', 'white', 'red']),
			title: 'Temperature (°C)'
		});

		$$renderer.push(`<!----> `);

		Legend($$renderer, {
			scale: scaleSqrt([-100, 0, 100], ['blue', 'white', 'red']),
			title: 'Temperature (°C)',
			variant: 'swatches'
		});

		$$renderer.push(`<!----></div>`);
	});
}