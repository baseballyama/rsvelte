import * as $ from 'svelte/internal/server';
import { Axis, Chart, Line, Layer } from 'layerchart';

export default function Styling_using_attributes($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 10, bottom: 20, left: 20, right: 10 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom', rule: true });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left', rule: true });
					$$renderer.push(`<!----> `);

					Line($$renderer, {
						x1: 100,
						y1: 100,
						x2: 200,
						y2: 200,
						strokeWidth: 10,
						stroke: 'var(--color-primary)'
					});

					$$renderer.push(`<!----> `);

					Line($$renderer, {
						x1: 50,
						y1: 150,
						x2: 400,
						y2: 150,
						strokeWidth: 2,
						stroke: 'var(--color-secondary)'
					});

					$$renderer.push(`<!----> `);

					Line($$renderer, {
						x1: 50,
						y1: 10,
						x2: 400,
						y2: 50,
						strokeWidth: 2,
						stroke: 'var(--color-accent)',
						markerStart: 'circle',
						markerEnd: 'arrow'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}