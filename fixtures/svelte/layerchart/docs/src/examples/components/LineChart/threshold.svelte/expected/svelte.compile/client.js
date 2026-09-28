import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	LineChart,
	defaultChartPadding,
	Spline,
	Threshold,
	Tooltip,
	Points
} from 'layerchart';

import { curveBumpX } from 'd3-shape';
import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';
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

	let selectedCurve = $.state($.proxy(curveBumpX));
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
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			{
				const above = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;

					Spline($$anchor, {
						y: 'value',
						get curve() {
							return curve();
						},
						class: 'stroke-success stroke-2'
					});
				};

				const below = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;

					Spline($$anchor, {
						y: 'value',
						get curve() {
							return curve();
						},
						class: 'stroke-danger stroke-2'
					});
				};

				const children = ($$anchor, $$arg0) => {
					let curve = () => ($$arg0?.()).curve;

					Spline($$anchor, {
						y: 'baseline',
						get curve() {
							return curve();
						},
						class: '[stroke-dasharray:4] opacity-20'
					});
				};

				Threshold(node_2, {
					get curve() {
						return $.get(selectedCurve);
					},
					above,
					below,
					children,
					$$slots: { above: true, below: true, default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			Points(node_3, { y: 'value', r: 4, class: 'stroke-surface-100' });
			$.append($$anchor, fragment_1);
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

		LineChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: ['value', 'baseline'],
			c: (d) => d.value >= d.baseline ? 'above' : 'below',
			cDomain: ['above', 'below'],
			cRange: ['var(--color-success)', 'var(--color-danger)'],
			props: { highlight: { lines: true, points: false } },
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