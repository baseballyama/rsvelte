import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Axis, BoxPlot, Chart, Layer, computeBoxStats } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Pre_computed($$anchor, $$props) {
	$.push($$props, true);

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
		}
	];

	const data = rawData.map((d) => ({ group: d.group, ...computeBoxStats(d.values) }));
	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.3));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'group',
			get xScale() {
				return $.get($0);
			},
			yDomain: [0, 100],
			yNice: true,
			padding: { left: 24, bottom: 20, top: 8 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true, rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', rule: true });

						var node_2 = $.sibling(node_1, 2);

						$.each(node_2, 17, () => data, $.index, ($$anchor, item) => {
							BoxPlot($$anchor, {
								get data() {
									return $.get(item);
								},
								min: 'min',
								q1: 'q1',
								median: 'median',
								q3: 'q3',
								max: 'max',
								outliers: 'outliers'
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}