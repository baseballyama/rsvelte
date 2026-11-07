import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Bar,
	Axis,
	Chart,
	Highlight,
	Layer,
	Tooltip,
	defaultChartPadding,
	groupStackData
} from 'layerchart';

import { fruitColors } from '$lib/utils/fruitColors';
import { scaleBand } from 'd3-scale';
import { sum } from 'd3-array';
import GroupedStackedComboControls from '$lib/components/controls/BarsControls.svelte';
import { longData } from '$lib/utils/data.js';
import { unique } from '@layerstack/utils';
import { cubicInOut } from 'svelte/easing';

var root = $.from_svg(`<!><!><g></g><!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Horizontal_grouped_stacked_or_both_transition($$anchor, $$props) {
	$.push($$props, true);

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];
	let chartMode = $.state('group');
	const groupBy = $.derived(() => ({ group: 'fruit', stack: undefined, groupStack: 'basket' })[$.get(chartMode)]);
	const stackBy = $.derived(() => ({ group: undefined, stack: 'fruit', groupStack: 'fruit' })[$.get(chartMode)]);

	const data = $.derived(() => groupStackData(longData, {
		xKey: 'year',
		groupBy: $.get(groupBy),
		stackBy: $.get(stackBy)
	}));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root_2();
	var node = $.first_child(fragment);

	GroupedStackedComboControls(node, {
		get chartMode() {
			return $.get(chartMode);
		},

		set chartMode($$value) {
			$.set(chartMode, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_2();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Axis(node_3, { placement: 'bottom', grid: true, rule: true });

					var node_4 = $.sibling(node_3);

					Axis(node_4, { placement: 'left', rule: true });

					var g = $.sibling(node_4);

					$.each(g, 21, () => $.get(data), (d) => d.year + '-' + d.fruit, ($$anchor, d) => {
						{
							let $0 = $.derived(() => context().cScale?.($.get(d).fruit));

							let $1 = $.derived(() => ({
								x: {
									type: 'tween',
									easing: cubicInOut,
									delay: $.get(groupBy) ? 0 : 300
								},
								y: {
									type: 'tween',
									easing: cubicInOut,
									delay: $.get(groupBy) ? 300 : 0
								},
								width: {
									type: 'tween',
									easing: cubicInOut,
									delay: $.get(groupBy) ? 0 : 300
								},
								height: {
									type: 'tween',
									easing: cubicInOut,
									delay: $.get(groupBy) ? 300 : 0
								}
							}));

							Bar($$anchor, {
								get data() {
									return $.get(d);
								},

								get fill() {
									return $.get($0);
								},
								strokeWidth: 1,
								get motion() {
									return $.get($1);
								}
							});
						}
					});

					$.reset(g);

					var node_5 = $.sibling(g);

					Highlight(node_5, { area: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_2();
					var node_7 = $.first_child(fragment_4);

					$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().year));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_9 = $.first_child(fragment_6);

								$.each(node_9, 17, () => data().data, $.index, ($$anchor, d) => {
									var fragment_7 = $.comment();
									var node_10 = $.first_child(fragment_7);

									{
										let $0 = $.derived(() => context().cScale?.($.get(d).fruit));

										$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												get label() {
													return $.get(d).fruit;
												},

												get value() {
													return $.get(d).value;
												},

												get color() {
													return $.get($0);
												},
												format: 'integer',
												valueAlign: 'right'
											});
										});
									}

									$.append($$anchor, fragment_7);
								});

								var node_11 = $.sibling(node_9, 2);

								$.component(node_11, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_12 = $.sibling(node_11, 2);

								{
									let $0 = $.derived(() => sum([...data().data], (d) => d.value));

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'total',
											get value() {
												return $.get($0);
											},
											format: 'integer',
											valueAlign: 'right'
										});
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => scaleBand().paddingInner(0.2).paddingOuter(0.1));
		let $1 = $.derived(() => $.get(groupBy) ? scaleBand().padding(0.1) : undefined);

		let $2 = $.derived(() => $.get(groupBy)
			? unique($.get(data).map((d) => d[$.get(groupBy)]))
			: undefined);

		let $3 = $.derived(() => defaultChartPadding({ left: 30, right: 15, bottom: 20 }));

		Chart(node_1, {
			get data() {
				return $.get(data);
			},
			x: 'values',
			xNice: true,
			y: 'year',
			get yScale() {
				return $.get($0);
			},
			c: 'fruit',
			get cDomain() {
				return colorKeys;
			},

			get cRange() {
				return fruitColors;
			},

			get y1() {
				return $.get(groupBy);
			},

			get y1Scale() {
				return $.get($1);
			},

			get y1Domain() {
				return $.get($2);
			},
			y1Range: ({ yScale }) => [0, yScale.bandwidth()],
			get padding() {
				return $.get($3);
			},
			tooltipContext: { mode: 'band' },
			height: 400,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}