import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { mean } from 'd3-array';
import { Bars, Axis, Chart, Layer, Rule, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Horizontal_average_annotation_rule($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const avg = $.derived(() => mean(data, (d) => d.value));

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', grid: true, rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Bars(node_2, { strokeWidth: 1, class: 'fill-primary' });

					var node_3 = $.sibling(node_2, 2);

					Rule(node_3, {
						get x() {
							return $.get(avg);
						},
						strokeWidth: 2,
						stroke: 'var(--color-danger)',
						dashArray: [4],
						'stroke-linecap': 'round'
					});

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => context().xScale($.get(avg)));

						Text(node_4, {
							get x() {
								return $.get($0);
							},
							y: 0,
							dx: -4,
							value: 'Avg',
							textAnchor: 'end',
							verticalAnchor: 'start',
							class: 'text-sm fill-danger stroke-surface-100 stroke-2'
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => scaleBand().padding(0.4));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			xDomain: [0, null],
			xNice: true,
			y: 'date',
			get yScale() {
				return $.get($0);
			},
			padding: { left: 32, bottom: 20, right: 8 },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}