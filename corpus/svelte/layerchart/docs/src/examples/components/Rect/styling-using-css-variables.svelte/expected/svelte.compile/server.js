import * as $ from 'svelte/internal/server';
import { Axis, Chart, Rect, Layer } from 'layerchart';

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
					Rect($$renderer, { x: 50, y: 50, width: 100, height: 150 });
					$$renderer.push(`<!----> `);

					Rect($$renderer, {
						x: 90,
						y: 80,
						width: 200,
						height: 100,
						style: '--fill-color: var(--color-primary);'
					});

					$$renderer.push(`<!----> `);

					Rect($$renderer, {
						x: 125,
						y: 40,
						width: 200,
						height: 100,
						strokeWidth: 1,
						style: '--fill-color: transparent; --stroke-color: var(--color-primary);'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}