import 'svelte/internal/disclose-version';
import { getAppleTicker } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { BarChart, Spline, Tooltip, defaultChartPadding } from 'layerchart';

const data = await getAppleTicker();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-stack p-4 border rounded-sm"><!> <!></div>`);

export default function Compound_separate_scales_with_stacked_charts_and_overridden_marks($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };
	var div = root_2();
	var node = $.child(div);

	{
		let $0 = $.derived(() => defaultChartPadding({ left: 25 }));

		BarChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'volume',
			yNice: true,
			axis: false,
			grid: false,
			props: {
				bars: { radius: 1, class: 'stroke-none fill-surface-content/10' }
			},

			get padding() {
				return $.get($0);
			},
			height: 300
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const marks = ($$anchor) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Spline(node_2, { y: 'open', class: 'stroke-primary' });

			var node_3 = $.sibling(node_2, 2);

			Spline(node_3, { y: 'close', class: 'stroke-secondary' });
			$.append($$anchor, fragment);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_7 = $.first_child(fragment_3);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'open',
										get value() {
											return data().open;
										},
										format: 'currency'
									});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'close',
										get value() {
											return data().close;
										},
										format: 'currency'
									});
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'high',
										get value() {
											return data().high;
										},
										format: 'currency'
									});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'low',
										get value() {
											return data().low;
										},
										format: 'currency'
									});
								});

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_4) => {
									Tooltip_Item_4($$anchor, {
										label: 'volume',
										get value() {
											return data().volume;
										},
										format: 'integer'
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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

		let $0 = $.derived(() => defaultChartPadding({ left: 25 }));

		BarChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: ['open', 'close'],
			yNice: true,
			yDomain: null,
			height: 300,
			props: {
				xAxis: { ticks: 10, rule: true },
				tooltip: { context: { mode: 'band' } }
			},

			get padding() {
				return $.get($0);
			},
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}