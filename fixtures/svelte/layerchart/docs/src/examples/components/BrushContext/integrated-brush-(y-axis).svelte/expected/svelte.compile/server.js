import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	ChartClipPath,
	Layer,
	LinearGradient,
	defaultChartPadding
} from 'layerchart';

import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Integrated_brush__y_axis_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let yDomain = [null, null];

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain,
			padding: defaultChartPadding({ left: 25, bottom: 24 }),
			brush: {
				axis: 'y',
				onBrushEnd: (e) => {
					yDomain = e.brush.y;
					e.brush.reset();
				}
			},
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						ChartClipPath($$renderer, {
							children: ($$renderer) => {
								{
									function children($$renderer, { gradient }) {
										Area($$renderer, { line: { class: 'stroke-2 stroke-primary' }, fill: gradient });
									}

									LinearGradient($$renderer, {
										class: 'from-primary/50 to-primary/1',
										vertical: true,
										children,
										$$slots: { default: true }
									});
								}
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

		$.bind_props($$props, { data });
	});
}