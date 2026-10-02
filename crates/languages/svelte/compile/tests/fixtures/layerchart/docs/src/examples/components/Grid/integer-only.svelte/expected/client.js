import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Grid, Layer, defaultChartPadding } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Integer_only($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 10, bottom: 10 }));

		Chart($$anchor, {
			yDomain: [0, 2],
			get padding() {
				return $.get($0);
			},
			height: 200,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Grid(node, {
							y: true,
							yTicks: (scale) => scale.ticks?.().filter(Number.isInteger)
						});

						var node_1 = $.sibling(node, 2);

						Axis(node_1, {
							placement: 'left',
							rule: true,
							ticks: (scale) => scale.ticks?.().filter(Number.isInteger),
							format: 'integer'
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}