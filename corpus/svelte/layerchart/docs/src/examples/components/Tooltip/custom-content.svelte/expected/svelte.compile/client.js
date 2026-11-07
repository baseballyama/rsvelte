import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	Axis,
	Chart,
	Layer,
	Highlight,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Custom_content($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 }));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			get padding() {
				return $.get($0);
			},
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'left', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'bottom', rule: true });

						var node_3 = $.sibling(node_2, 2);

						Area(node_3, {
							class: 'fill-primary/30',
							line: { class: 'stroke-primary stroke-2' }
						});

						var node_4 = $.sibling(node_3, 2);

						Highlight(node_4, { points: true, lines: true });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node, 2);

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Anything can go here test');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}