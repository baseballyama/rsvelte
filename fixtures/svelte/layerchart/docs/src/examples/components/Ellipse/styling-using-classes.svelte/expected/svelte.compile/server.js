import * as $ from 'svelte/internal/server';
import { Axis, Chart, Ellipse, Layer } from 'layerchart';

export default function Styling_using_classes($$renderer) {
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
					Ellipse($$renderer, { cx: 100, cy: 100, rx: 20, ry: 10 });
					$$renderer.push(`<!----> `);

					Ellipse($$renderer, {
						cx: 200,
						cy: 200,
						rx: 20,
						ry: 10,
						class: 'fill-primary bg-primary'
					});

					$$renderer.push(`<!----> `);

					Ellipse($$renderer, {
						cx: 200,
						cy: 50,
						rx: 20,
						ry: 10,
						fill: 'var(--color-secondary)'
					});

					$$renderer.push(`<!----> `);

					Ellipse($$renderer, {
						cx: 300,
						cy: 150,
						rx: 20,
						ry: 10,
						class: 'stroke-2 stroke-primary fill-primary/10 bg-primary/10 border-2 border-primary'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}