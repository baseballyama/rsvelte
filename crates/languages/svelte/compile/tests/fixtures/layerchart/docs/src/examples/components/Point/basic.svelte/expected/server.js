import * as $ from 'svelte/internal/server';
import { Axis, Chart, Circle, Point, Layer } from 'layerchart';

export default function Basic($$renderer, $$props) {
	let data = [];

	Chart($$renderer, {
		data,
		x: (d) => d.x,
		y: (d) => d.y,
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

					{
						function children($$renderer, { x, y }) {
							Circle($$renderer, { cx: x, cy: y, r: 10 });
						}

						Point($$renderer, { d: { x: 50, y: 50 }, children, $$slots: { default: true } });
					}

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { x, y }) {
							Circle($$renderer, { cx: x, cy: y, r: 15, class: 'fill-primary bg-primary' });
						}

						Point($$renderer, { d: { x: 20, y: 20 }, children, $$slots: { default: true } });
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.bind_props($$props, { data });
}