import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, Tooltip, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Custom_tooltip($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => context().y(data())]);
					$.append($$anchor, text);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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

			var node_1 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;

					$.next();

					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => format(context().x(data()), 'day')]);
					$.append($$anchor, text_1);
				};

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
					Tooltip_Root_1($$anchor, {
						x: 'data',
						get y() {
							return context().height;
						},
						anchor: 'top',
						contained: false,
						variant: 'none',
						class: 'text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap',
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => defaultChartPadding({ right: 10 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get padding() {
				return $.get($0);
			},
			height: 300,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}