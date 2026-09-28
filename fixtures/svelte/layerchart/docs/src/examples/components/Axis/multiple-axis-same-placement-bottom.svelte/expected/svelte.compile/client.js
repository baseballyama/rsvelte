import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { timeMonth, timeYear } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Multiple_axis_same_placement_bottom($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	{
		let $0 = $.derived(() => [timeYear.offset(today, -2), today]);
		let $1 = $.derived(() => defaultChartPadding({ bottom: 32 }));

		Chart($$anchor, {
			get xDomain() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 48,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => ({ interval: timeMonth.every(3) }));

							Axis(node, {
								placement: 'bottom',
								get ticks() {
									return $.get($0);
								},
								format: (d) => 'Q' + (d.getMonth() / 3 + 1),
								rule: true
							});
						}

						var node_1 = $.sibling(node, 2);

						{
							let $0 = $.derived(() => ({ interval: timeYear.every(1) }));

							Axis(node_1, {
								placement: 'bottom',
								get ticks() {
									return $.get($0);
								},
								tickLength: 0,
								tickLabelProps: { dy: 20, class: 'text-sm' }
							});
						}

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