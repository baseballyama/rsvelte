import * as $ from 'svelte/internal/server';

import {
	Area,
	Chart,
	ChartGroup,
	Layer,
	LineChart,
	defaultChartPadding
} from 'layerchart';

import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Coordinated_views($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { group }) {
				const viewport = group.brush.active ? group.brush : group.domain;

				LineChart($$renderer, {
					data,
					x: 'date',
					y: 'value',
					yDomain: [0, null],
					transform: {
						mode: 'domain',
						axis: 'x',
						scaleExtent: [1, 50],
						domainExtent: {
							x: { min: 'data', max: 'data', minRange: 7 * 24 * 60 * 60 * 1000 }
						}
					},
					clip: true,
					padding: defaultChartPadding({ left: 25, bottom: 24 }),
					height: 280
				});

				$$renderer.push(`<!----> `);

				Chart($$renderer, {
					data,
					x: 'date',
					y: 'value',
					brush: { x: viewport.x ?? [null, null] },
					groupOptions: { publish: ['domain'], subscribe: ['pointer'] },
					padding: { left: 16 },
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
			}

			ChartGroup($$renderer, { domain: { axis: 'x' }, children, $$slots: { default: true } });
		}

		$.bind_props($$props, { data });
	});
}