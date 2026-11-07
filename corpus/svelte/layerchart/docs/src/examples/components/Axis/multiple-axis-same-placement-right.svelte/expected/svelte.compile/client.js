import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { range } from 'd3-array';

var root = $.from_html(`<!> <!>`, 1);

export default function Multiple_axis_same_placement_right($$anchor, $$props) {
	$.push($$props, true);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => scaleLinear([0, 100], [context().height, 0]));

						Axis(node, {
							label: 'Celsius',
							get scale() {
								return $.get($0);
							},
							placement: 'right',
							rule: true,
							labelProps: { dx: -60 }
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						let $0 = $.derived(() => scaleLinear([32, 212], [context().height, 0]));
						let $1 = $.derived(() => range(0, 100 + 1, 10).map((x) => x * (9 / 5) + 32));

						Axis(node_1, {
							label: 'Fahrenheit',
							get scale() {
								return $.get($0);
							},

							get ticks() {
								return $.get($1);
							},
							placement: 'right',
							rule: true,
							x: 50,
							labelProps: { dx: -50 }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 90 }));

		Chart($$anchor, {
			yDomain: [0, 100],
			get padding() {
				return $.get($0);
			},
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}