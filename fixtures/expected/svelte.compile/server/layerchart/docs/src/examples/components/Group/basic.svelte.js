import * as $ from 'svelte/internal/server';
import { Axis, Chart, Circle, Group, Text, Layer } from 'layerchart';

export default function Basic($$renderer) {
	Chart($$renderer, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { bottom: 20, left: 20 },
		height: 300,
		children: ($$renderer) => {
			Layer($$renderer, {
				children: ($$renderer) => {
					Axis($$renderer, { placement: 'bottom', rule: true });
					$$renderer.push(`<!----> `);
					Axis($$renderer, { placement: 'left', rule: true });
					$$renderer.push(`<!----> `);

					Group($$renderer, {
						center: true,
						children: ($$renderer) => {
							Circle($$renderer, { r: 20, class: 'fill-surface-content' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Group($$renderer, {
						x: 100,
						y: 100,
						children: ($$renderer) => {
							Circle($$renderer, { r: 10, class: 'fill-surface-content' });
							$$renderer.push(`<!----> `);

							Text($$renderer, {
								value: 'point',
								textAnchor: 'middle',
								verticalAnchor: 'start',
								class: 'text-xs',
								dy: 12
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}