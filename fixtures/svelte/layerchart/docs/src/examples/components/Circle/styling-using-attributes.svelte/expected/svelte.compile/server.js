import * as $ from 'svelte/internal/server';
import { Axis, Chart, Circle, Layer } from 'layerchart';

export default function Styling_using_attributes($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 10, bottom: 20, left: 24, right: 10 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom', rule: true });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left', rule: true });
					$$renderer.push(`<!----> `);

					Circle($$renderer, {
						cx: 100,
						cy: 100,
						r: 20,
						fill: 'var(--color-surface-content)'
					});

					$$renderer.push(`<!----> `);
					Circle($$renderer, { cx: 200, cy: 200, r: 20, fill: 'var(--color-primary)' });
					$$renderer.push(`<!----> `);
					Circle($$renderer, { cx: 200, cy: 50, r: 20, fill: 'var(--color-secondary)' });
					$$renderer.push(`<!----> `);

					Circle($$renderer, {
						cx: 300,
						cy: 150,
						r: 20,
						stroke: 'var(--color-primary)',
						strokeWidth: 2,
						fill: 'var(--color-primary)',
						fillOpacity: 0.1
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}