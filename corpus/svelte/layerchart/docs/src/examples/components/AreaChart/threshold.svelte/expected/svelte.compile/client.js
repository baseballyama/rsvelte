import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Area,
	AreaChart,
	defaultChartPadding,
	Spline,
	Threshold,
	Tooltip
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';
import { curveStepAfter } from 'd3-shape';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Threshold_1($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 50,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let selectedCurve = $.state($.proxy(curveStepAfter));
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	CurveMenuField(node, {
		dense: true,
		class: 'mb-10',
		get value() {
			return $.get(selectedCurve);
		},

		set value($$value) {
			$.set(selectedCurve, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const marks = ($$anchor) => {
			{
				const above = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;

					Area($$anchor, {
						y0: 'value',
						y1: 'baseline',
						get curve() {
							return curve();
						},
						class: 'fill-success/30'
					});
				};

				const below = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;

					Area($$anchor, {
						y0: 'value',
						y1: 'baseline',
						get curve() {
							return curve();
						},
						class: 'fill-danger/30'
					});
				};

				const children = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;
					var fragment_4 = root();
					var node_2 = $.first_child(fragment_4);

					Spline(node_2, {
						y: 'baseline',
						get curve() {
							return curve();
						},
						class: '[stroke-dasharray:4]'
					});

					var node_3 = $.sibling(node_2, 2);

					Spline(node_3, {
						y: 'value',
						get curve() {
							return curve();
						},
						class: 'stroke-[1.5]'
					});

					$.append($$anchor, fragment_4);
				};

				Threshold($$anchor, {
					get curve() {
						return $.get(selectedCurve);
					},
					above,
					below,
					children,
					$$slots: { above: true, below: true, default: true }
				});
			}
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_5 = $.comment();
			var node_4 = $.first_child(fragment_5);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = root();
					var node_5 = $.first_child(fragment_6);

					$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(data().date)]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_7 = $.first_child(fragment_8);

								$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										}
									});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'baseline',
										get value() {
											return data().baseline;
										}
									});
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_10 = $.sibling(node_9, 2);

								{
									let $0 = $.derived(() => data().value - data().baseline);

									$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'variance',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
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

			$.append($$anchor, fragment_5);
		};

		let $0 = $.derived(() => defaultChartPadding({ top: 10, right: 10 }));

		AreaChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: ['value', 'baseline'],
			props: {
				highlight: { area: true, lines: false, points: false },
				tooltip: { context: { mode: 'bisect-x', findTooltipData: 'left' } }
			},

			get padding() {
				return $.get($0);
			},
			height: 300,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}