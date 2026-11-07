import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { timeDay } from 'd3-time';
import { Bars, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Simple_bars($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let settings = $.state($.proxy({
		mode: 'band',
		highlight: ['area'],
		axis: undefined,
		snapToDataX: false,
		snapToDataY: false
	}));

	var $$exports = { data };
	var fragment = root_1();
	var node = $.first_child(fragment);

	TooltipContextControls(node, {
		get settings() {
			return $.get(settings);
		},

		set settings($$value) {
			$.set(settings, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ mode: $.get(settings).mode }));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			get xInterval() {
				return timeDay;
			},
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			padding: { top: 5, left: 28, bottom: 24 },
			get tooltipContext() {
				return $.get($0);
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				Layer(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						Axis(node_3, { placement: 'left', grid: true, rule: true });

						var node_4 = $.sibling(node_3, 2);

						Axis(node_4, { placement: 'bottom', rule: true });

						var node_5 = $.sibling(node_4, 2);

						Bars(node_5, { radius: 4, strokeWidth: 1, class: 'fill-primary' });

						var node_6 = $.sibling(node_5, 2);

						{
							let $0 = $.derived(() => $.get(settings).highlight.includes('points'));
							let $1 = $.derived(() => $.get(settings).highlight.includes('lines'));
							let $2 = $.derived(() => $.get(settings).highlight.includes('area'));

							Highlight(node_6, {
								get points() {
									return $.get($0);
								},

								get lines() {
									return $.get($1);
								},

								get area() {
									return $.get($2);
								},

								get axis() {
									return $.get(settings).axis;
								}
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_2, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_3 = root_1();
						var node_8 = $.first_child(fragment_3);

						$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().date;
								},
								format: 'day'
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_10 = $.first_child(fragment_4);

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return data().value;
											}
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					};

					let $0 = $.derived(() => $.get(settings).snapToDataX ? 'data' : 'pointer');
					let $1 = $.derived(() => $.get(settings).snapToDataY ? 'data' : 'pointer');

					$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, {
							get x() {
								return $.get($0);
							},

							get y() {
								return $.get($1);
							},
							children,
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}