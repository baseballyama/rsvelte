import * as $ from 'svelte/internal/server';
import { Axis, Chart, Circle, Layer } from 'layerchart';

export default function Styling_using_css_variables($$renderer) {
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
					Circle($$renderer, { cx: 100, cy: 100, r: 20 });
					$$renderer.push(`<!----> `);

					Circle($$renderer, {
						cx: 200,
						cy: 200,
						r: 20,
						style: '--fill-color:var(--color-primary)'
					});

					$$renderer.push(`<!----> `);

					Circle($$renderer, {
						cx: 200,
						cy: 50,
						r: 20,
						style: '--fill-color:var(--color-secondary)'
					});

					$$renderer.push(`<!----> `);

					Circle($$renderer, {
						cx: 300,
						cy: 150,
						r: 20,
						style: '--fill-color:var(--color-primary); --stroke-color:var(--color-primary)',
						strokeWidth: 2,
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