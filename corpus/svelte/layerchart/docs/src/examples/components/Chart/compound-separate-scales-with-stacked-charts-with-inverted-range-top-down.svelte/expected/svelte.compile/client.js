import 'svelte/internal/disclose-version';
import { getHydro } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { Axis, BarChart, Tooltip, defaultChartPadding } from 'layerchart';
import { scaleTime } from 'd3-scale';
import { extent } from 'd3-array';

const data = await getHydro();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-stack p-4 border rounded-sm"><!> <!></div>`);

export default function Compound_separate_scales_with_stacked_charts_with_inverted_range_top_down($$anchor, $$props) {
	$.push($$props, true);
	1;

	var $$exports = { data };
	var div = root_2();
	var node = $.child(div);

	BarChart(node, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'rain',
		axis: { placement: 'right', tickMarks: false },
		yDomain: [0, 500],
		yRange: ({ height }) => [0, height],
		padding: { left: 32, right: 32, bottom: 20 },
		props: {
			bars: { rounded: 'none', class: '_stroke-none fill-blue-500' }
		},
		height: 300
	});

	var node_1 = $.sibling(node, 2);

	{
		const axis = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Axis(node_2, { placement: 'left' });

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => scaleTime(extent(data, (d) => d.date), [0, context().width]));

				Axis(node_3, {
					placement: 'bottom',
					get scale() {
						return $.get($0);
					},
					tickMultiline: true,
					rule: true
				});
			}

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
										label: 'rain',
										color: 'hsl(200 100% 50%)',
										get value() {
											return data().rain;
										}
									});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'infiltration',
										color: 'hsl(25, 95%, 53%)',
										get value() {
											return data().infiltration;
										}
									});
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'dirtyh2o',
										color: 'hsl(0, 84%, 60%)',
										get value() {
											return data().dirtyh2o;
										}
									});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'rain_induced',
										color: 'hsl(142, 71%, 45%)',
										get value() {
											return data().rain_induced;
										}
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

		let $0 = $.derived(() => defaultChartPadding({ top: 20, bottom: 30, right: 32, left: 32 }));

		BarChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			yDomain: [0, 1000],
			series: [
				{
					key: 'infiltration',
					value: (d) => d.infiltration > 0 ? d.infiltration : 0,
					color: 'hsl(25, 95%, 53%)',
					props: { rounded: 'none' }
				},

				{
					key: 'dirtyh2o',
					color: 'hsl(0, 84%, 60%)',
					props: { rounded: 'none' }
				},

				{
					key: 'rain_induced',
					color: 'hsl(142, 71%, 45%)',
					props: { rounded: 'none' }
				}
			],

			get padding() {
				return $.get($0);
			},
			height: 300,
			axis,
			tooltip,
			$$slots: { axis: true, tooltip: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}