import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand, scaleOrdinal } from 'd3-scale';
import { Axis, BoxPlot, Chart, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Styled($$anchor, $$props) {
	$.push($$props, true);

	const data = [
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

	const colors = scaleOrdinal().domain(['A', 'B', 'C', 'D']).range([
		'oklch(0.7 0.15 200)',
		'oklch(0.7 0.15 260)',
		'oklch(0.7 0.15 320)',
		'oklch(0.7 0.15 30)'
	]);

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
							{
								let $0 = $.derived(() => colors($.get(item).group));
								let $1 = $.derived(() => colors($.get(item).group));

								BoxPlot($$anchor, {
									get data() {
										return $.get(item);
									},
									values: 'values',
									get fill() {
										return $.get($0);
									},
									fillOpacity: 0.3,
									get stroke() {
										return $.get($1);
									},
									strokeWidth: 1.5,
									radius: 4,
									outlierRadius: 4
								});
							}
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