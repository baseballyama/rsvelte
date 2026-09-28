import * as $ from 'svelte/internal/server';
import { Axis, Chart, Grid, Layer } from 'layerchart';

export default function Band_scale_between($$renderer) {
	Chart($$renderer, {
		xDomain: ['One', 'Two', 'Three', 'Four', 'Five'],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 100,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Grid($$renderer, { x: true, bandAlign: 'between' });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'bottom', rule: true });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}