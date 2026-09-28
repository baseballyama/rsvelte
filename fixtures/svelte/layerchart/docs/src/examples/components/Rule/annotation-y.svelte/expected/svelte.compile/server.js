import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Rule } from 'layerchart';

export default function Annotation_y($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: 20,
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom', rule: true });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left', rule: true });
					$$renderer.push(`<!----> `);

					Rule($$renderer, {
						y: 70,
						strokeWidth: 2,
						stroke: 'var(--color-danger)',
						dashArray: [4],
						'stroke-linecap': 'round'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}