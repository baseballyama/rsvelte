import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';

import {
	Axis,
	BoxPlot,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	computeBoxStats
} from 'layerchart';

export default function With_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rawData = [
			{
				group: 'A',
				values: [
					2,
					7,
					8,
					12,
					15,
					18,
					21,
					25,
					27,
					30,
					32,
					35,
					38,
					40,
					42,
					45,
					50,
					55,
					60,
					85
				]
			},

			{
				group: 'B',
				values: [
					10,
					15,
					18,
					20,
					22,
					25,
					28,
					30,
					32,
					35,
					37,
					40,
					42,
					45,
					48,
					50,
					55,
					58,
					62,
					65
				]
			},

			{
				group: 'C',
				values: [
					5,
					8,
					10,
					12,
					15,
					18,
					20,
					22,
					25,
					28,
					30,
					33,
					35,
					38,
					40,
					42,
					45,
					48,
					70,
					75
				]
			},

			{
				group: 'D',
				values: [
					1,
					20,
					25,
					30,
					35,
					38,
					40,
					42,
					45,
					48,
					50,
					52,
					55,
					58,
					60,
					62,
					65,
					70,
					75,
					95
				]
			}
		];

		const data = rawData.map((d) => ({ group: d.group, ...computeBoxStats(d.values) }));

		Chart($$renderer, {
			data,
			x: 'group',
			xScale: scaleBand().padding(0.3),
			y: 'median',
			yDomain: [0, 100],
			yNice: true,
			tooltipContext: { mode: 'band' },
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(data);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							BoxPlot($$renderer, {
								data: item,
								min: 'min',
								q1: 'q1',
								median: 'median',
								q3: 'q3',
								max: 'max',
								outliers: 'outliers'
							});
						}

						$$renderer.push(`<!--]--> `);
						Highlight($$renderer, { area: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.group });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Max', value: data.max });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Q3', value: data.q3 });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Median', value: data.median });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Q1', value: data.q1 });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Min', value: data.min });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (data.outliers?.length) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Outliers', value: data.outliers.join(', ') });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}