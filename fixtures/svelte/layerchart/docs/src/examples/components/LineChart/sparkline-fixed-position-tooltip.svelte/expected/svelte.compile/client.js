import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="whitespace-nowrap"> </div> <div class="font-semibold"> </div>`, 1);

export default function Sparkline_fixed_position_tooltip($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 50, min: 50, max: 100 });
	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root();
					var div = $.first_child(fragment_2);
					var text = $.only_child(div, true);
					var div_1 = $.sibling(div, 2);
					var text_1 = $.only_child(div_1, true);

					$.template_effect(
						($0) => {
							$.set_text(text, $0);
							$.set_text(text_1, data().value);
						},
						[() => format(data().date, 'day')]
					);

					$.append($$anchor, fragment_2);
				};

				let $0 = $.derived(() => context().width + 8);

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						class: 'text-xs',
						contained: false,
						y: -3,
						get x() {
							return $.get($0);
						},
						variant: 'none',
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: null,
			axis: false,
			grid: false,
			props: {
				highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
			},
			width: 124,
			height: 24,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}