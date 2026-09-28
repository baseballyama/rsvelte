import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { startOfInterval } from '@layerstack/utils';
import { timeDay } from 'd3-time';

var root = $.from_html(`<!> <!>`, 1);

export default function Radial_rule($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());
	const yesterday = new Date(today.getTime() - 1);

	{
		let $0 = $.derived(() => [timeDay.offset(today, -10), yesterday]);

		Chart($$anchor, {
			get xDomain() {
				return $.get($0);
			},
			yDomain: [0, 100],
			radial: true,
			padding: 24,
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					center: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						Axis(node, { placement: 'radius', rule: true });

						var node_1 = $.sibling(node, 2);

						Axis(node_1, { placement: 'angle', rule: true });
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