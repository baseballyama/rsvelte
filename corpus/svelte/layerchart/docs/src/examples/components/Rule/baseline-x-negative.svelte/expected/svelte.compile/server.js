import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Rule } from 'layerchart';

export default function Baseline_x_negative($$renderer) {
	Chart($$renderer, {
		xDomain: [-20, 100],
		yDomain: [0, 100],
		padding: 20,
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom' });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left' });
					$$renderer.push(`<!----> `);
					Rule($$renderer, { x: 0 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}