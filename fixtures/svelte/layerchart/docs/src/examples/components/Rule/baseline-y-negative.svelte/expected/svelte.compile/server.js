import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Rule } from 'layerchart';

export default function Baseline_y_negative($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [-20, 100],
		padding: 20,
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom' });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left' });
					$$renderer.push(`<!----> `);
					Rule($$renderer, { y: 0 });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}