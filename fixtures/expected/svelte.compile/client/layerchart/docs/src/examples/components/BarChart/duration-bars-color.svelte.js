import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, defaultChartPadding, Tooltip } from 'layerchart';
import { scaleTime } from 'd3-scale';
import { timeMinute, timeDay } from 'd3-time';
import { Duration } from 'svelte-ux';
import { getRandomInteger } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Duration_bars_color($$anchor, $$props) {
	$.push($$props, true);

	const count = 10;
	const now = timeDay.floor(new Date());
	let lastStartDate = now;

	const data = Array.from({ length: count }).map((_, i) => {
		const startDate = timeMinute.offset(lastStartDate, getRandomInteger(0, 60));
		const endDate = timeMinute.offset(startDate, getRandomInteger(0, 60));

		lastStartDate = startDate;

		return { name: `Item ${i + 1}`, startDate, endDate };
	});

	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'start',
										get value() {
											return data().startDate;
										},
										format: { type: 'time', options: { variant: 'short' } }
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'end',
										get value() {
											return data().endDate;
										},
										format: { type: 'time', options: { variant: 'short' } }
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'duration',
										valueAlign: 'right',
										children: ($$anchor, $$slotProps) => {
											Duration($$anchor, {
												get start() {
													return data().startDate;
												},

												get end() {
													return data().endDate;
												},
												totalUnits: 2
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(scaleTime);
		let $1 = $.derived(() => defaultChartPadding({ left: 36, right: 20 }));

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: ['startDate', 'endDate'],
			get xScale() {
				return $.get($0);
			},
			y: 'name',
			c: 'name',
			cRange: [
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-success)',
				'var(--color-info)'
			],
			grid: { x: false, y: true, bandAlign: 'between' },
			orientation: 'horizontal',
			get padding() {
				return $.get($1);
			},
			height: 300,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}