import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Multiple_axis_grid_with_single_rule($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	{
		let $0 = $.derived(() => [timeDay.offset(today, -10), today]);

		Chart($$anchor, {
			get xDomain() {
				return $.get($0);
			},
			yDomain: [0, 100],
			yNice: true,
			padding: { top: 20, bottom: 20, left: 20, right: 20 },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'left', grid: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'bottom', grid: true, rule: true });
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