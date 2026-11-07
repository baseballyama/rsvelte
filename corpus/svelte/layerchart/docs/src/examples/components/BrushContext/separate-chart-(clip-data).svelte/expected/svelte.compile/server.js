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

export default function Separate_chart__clip_data_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let xDomain = [null, null];

		Chart($$renderer, {
			data,
			x: 'date',
			xDomain,
			y: 'value',
			yDomain: [0, null],
			padding: defaultChartPadding({ left: 25, bottom: 24 }),
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

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			padding: { left: 16 },
			brush: {
				onChange: (e) => {
					xDomain = e.brush.x;
				}
			},
			height: 40,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Area($$renderer, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { data });
	});
}