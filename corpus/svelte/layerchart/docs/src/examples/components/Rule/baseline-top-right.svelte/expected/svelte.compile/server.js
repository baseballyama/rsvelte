import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Rule } from 'layerchart';

export default function Baseline_top_right($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: 20,
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'top' });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'right' });
					$$renderer.push(`<!----> `);
					Rule($$renderer, { x: '$right', y: '$top' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}