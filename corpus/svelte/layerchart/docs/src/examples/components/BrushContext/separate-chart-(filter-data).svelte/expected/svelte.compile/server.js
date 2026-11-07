import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Layer,
	LinearGradient,
	defaultChartPadding
} from 'layerchart';

import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Separate_chart__filter_data_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// The lower chart owns the brush; filter the upper chart's data by its selection
		let brushChart = void 0;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, {
				data: data.filter((d) => brushChart?.brush.contains({ x: d.date }) ?? true),
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				padding: defaultChartPadding({ left: 25, bottom: 24 }),
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, {
								placement: 'left',
								grid: true,
								rule: true,
								motion: { type: 'tween', duration: 200 }
							});

							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							{
								function children($$renderer, { gradient }) {
									Area($$renderer, {
										line: { class: 'stroke-2 stroke-primary' },
										fill: gradient,
										motion: { type: 'tween', duration: 200 }
									});
								}

								LinearGradient($$renderer, {
									class: 'from-primary/50 to-primary/1',
									vertical: true,
									children,
									$$slots: { default: true }
								});
							}

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
				brush: true,
				height: 40,
				get context() {
					return brushChart;
				},

				set context($$value) {
					brushChart = $$value;
					$$settled = false;
				},

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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}