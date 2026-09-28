import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Chart,
	ChartGroup,
	Layer,
	LineChart,
	defaultChartPadding
} from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);

export default function Coordinated_views($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let group = () => ($$arg0?.()).group;
			const viewport = $.derived(() => group().brush.active ? group().brush : group().domain);
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 24 }));

				LineChart(node, {
					get data() {
						return data;
					},
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
					get padding() {
						return $.get($0);
					},
					height: 280
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => ({ x: $.get(viewport).x ?? [null, null] }));

				Chart(node_1, {
					get data() {
						return data;
					},
					x: 'date',
					y: 'value',
					get brush() {
						return $.get($0);
					},
					groupOptions: { publish: ['domain'], subscribe: ['pointer'] },
					padding: { left: 16 },
					height: 40,
					children: ($$anchor, $$slotProps) => {
						Layer($$anchor, {
							children: ($$anchor, $$slotProps) => {
								Area($$anchor, {
									line: { class: 'stroke-2 stroke-primary' },
									class: 'fill-primary/20'
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		};

		ChartGroup($$anchor, { domain: { axis: 'x' }, children, $$slots: { default: true } });
	}

	return $.pop($$exports);
}