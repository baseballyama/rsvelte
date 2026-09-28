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
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="text-sm mb-4"><!></div> <!>`, 1);

export default function Externally_access_tooltip_data($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let context = $.state(void 0);
	var $$exports = { data };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(
						($0) => $.set_text(text, `date: ${$0 ?? ''}
			value: ${$.get(context).tooltip.data.value ?? ''}`),
						[
							() => format($.get(context).tooltip.data.date, 'day', { variant: 'short' })
						]
					);

					$.append($$anchor, text);
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text('[hover chart]');

					$.append($$anchor, text_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(context).tooltip.data) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(context)) $$render(consequent_1);
		});
	}

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 }));

		Chart(node_2, {
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
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_1();
				var node_3 = $.first_child(fragment_3);

				Layer(node_3, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_4 = $.first_child(fragment_4);

						Axis(node_4, { placement: 'left', grid: true, rule: true });

						var node_5 = $.sibling(node_4, 2);

						Axis(node_5, { placement: 'bottom', rule: true });

						var node_6 = $.sibling(node_5, 2);

						Area(node_6, {
							class: 'fill-primary/30',
							line: { class: 'stroke-primary stroke-2' }
						});

						var node_7 = $.sibling(node_6, 2);

						Highlight(node_7, { points: true, lines: true });
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_3, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_5 = root_1();
						var node_9 = $.first_child(fragment_5);

						$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().date;
								},
								format: 'day'
							});
						});

						var node_10 = $.sibling(node_9, 2);

						$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_11 = $.first_child(fragment_6);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return data().value;
											}
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					};

					$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}