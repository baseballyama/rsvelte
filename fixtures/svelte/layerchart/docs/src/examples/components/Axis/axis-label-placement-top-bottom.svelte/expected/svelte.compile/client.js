import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { timeDay } from 'd3-time';
import { startOfInterval } from '@layerstack/utils';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Axis_label_placement_top_bottom($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	{
		let $0 = $.derived(() => [timeDay.offset(today, -10), today]);

		Chart($$anchor, {
			get xDomain() {
				return $.get($0);
			},
			padding: { top: 40, bottom: 40, left: 24, right: 24 },
			height: 200,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, {
							label: 'top start',
							placement: 'top',
							labelPlacement: 'start',
							rule: true
						});

						var node_1 = $.sibling(node, 2);

						Axis(node_1, {
							label: 'top middle',
							placement: 'top',
							labelPlacement: 'middle',
							rule: true
						});

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, {
							label: 'top end',
							placement: 'top',
							labelPlacement: 'end',
							rule: true
						});

						var node_3 = $.sibling(node_2, 2);

						Axis(node_3, {
							label: 'bottom start',
							placement: 'bottom',
							labelPlacement: 'start',
							rule: true
						});

						var node_4 = $.sibling(node_3, 2);

						Axis(node_4, {
							label: 'bottom middle',
							placement: 'bottom',
							labelPlacement: 'middle',
							rule: true
						});

						var node_5 = $.sibling(node_4, 2);

						Axis(node_5, {
							label: 'bottom end',
							placement: 'bottom',
							labelPlacement: 'end',
							rule: true
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