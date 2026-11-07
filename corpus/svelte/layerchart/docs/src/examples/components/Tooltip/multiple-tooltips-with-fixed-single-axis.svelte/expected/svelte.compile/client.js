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

import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Multiple_tooltips_with_fixed_single_axis($$anchor, $$props) {
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
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
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

					Highlight(node_4, { points: true, lines: true, axis: 'both' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, data().value));
					$.append($$anchor, text);
				};

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get x() {
							return context().padding.left;
						},
						y: 'data',
						anchor: 'right',
						contained: false,
						variant: 'none',
						class: 'text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap',
						children,
						$$slots: { default: true }
					});
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => format(data().date, 'day')]);
					$.append($$anchor, text_1);
				};

				let $0 = $.derived(() => context().height + context().padding.top + 2);

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
					Tooltip_Root_1($$anchor, {
						x: 'data',
						get y() {
							return $.get($0);
						},
						anchor: 'top',
						variant: 'none',
						class: 'text-[10px] font-semibold text-primary bg-surface-100 px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap',
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

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
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}