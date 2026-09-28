import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { interpolateRainbow } from 'd3-scale-chromatic';

export default function Months($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const months = [
			{ month: 'Jan', days: 31 },
			{ month: 'Feb', days: 28 },
			{ month: 'Mar', days: 31 },
			{ month: 'Apr', days: 30 },
			{ month: 'May', days: 31 },
			{ month: 'Jun', days: 30 },
			{ month: 'Jul', days: 31 },
			{ month: 'Aug', days: 31 },
			{ month: 'Sep', days: 30 },
			{ month: 'Oct', days: 31 },
			{ month: 'Nov', days: 30 },
			{ month: 'Dec', days: 31 }
		];

		// Stack months end-to-end as cumulative day ranges so each datum is a
		// segment along the x axis colored by month.
		const data = [];

		let acc = 0;

		for (const m of months) {
			data.push({ month: m.month, values: [acc, acc + m.days] });
			acc += m.days;
		}

		// Sample the cyclical rainbow interpolator at 12 evenly-spaced points so
		// adjacent months get adjacent hues and Dec wraps back toward Jan.
		const colors = months.map((_, i) => interpolateRainbow(i / months.length));

		{
			function marks($$renderer) {
				Waffle($$renderer, { axis: 'x', unit: 1, tooltip: true });
			}

			function tooltip($$renderer) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.month)}`);
								},
								$$slots: { default: true }
							});

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

										Tooltip.Item($$renderer, {
											label: 'Days',
											value: data.values[1] - data.values[0],
											format: 'integer'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
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
			}

			Chart($$renderer, {
				data,
				x: 'values',
				xDomain: [0, 365],
				y: (d) => '',
				c: 'month',
				cRange: colors,
				padding: { left: 8, bottom: 32, top: 8, right: 8 },
				height: 140,
				axis: { placement: 'bottom', label: 'days →', labelPlacement: 'end' },
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}