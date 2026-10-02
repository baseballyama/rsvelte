import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Axis,
	Bar,
	Chart,
	Layer,
	Tooltip,
	defaultChartPadding,
	groupStackData
} from 'layerchart';

import { fruitColors } from '$lib/utils/fruitColors';
import { scaleBand } from 'd3-scale';
import { longData } from '$lib/utils/data.js';
import { cubicInOut } from 'svelte/easing';
import { unique } from '@layerstack/utils';
import GroupedStackedComboField from '$lib/components/controls/fields/GroupedStackedComboField.svelte';

var root = $.from_svg(`<!><!><g></g>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Vertical_tooltip_and_click_handlers_for_individual_stack_grouped_bar($$anchor, $$props) {
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

	var fragment = root_1();
	var node = $.first_child(fragment);

	GroupedStackedComboField(node, {
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
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Layer(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Axis(node_3, { placement: 'left', grid: true, rule: true });

					var node_4 = $.sibling(node_3);

					Axis(node_4, { placement: 'bottom', rule: true });

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
								},
								class: 'cursor-pointer',
								onclick: (e) => {
									alert('You clicked on: ' + JSON.stringify($.get(d), null, 2));
								},
								onpointerenter: (e) => context().tooltip.show(e, $.get(d)),
								onpointermove: (e) => context().tooltip.show(e, $.get(d)),
								onpointerleave: (e) => context().tooltip.hide()
							});
						}
					});

					$.reset(g);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_1();
					var node_6 = $.first_child(fragment_4);

					$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_8 = $.first_child(fragment_6);

								{
									let $0 = $.derived(() => context().cScale?.(data().fruit));

									$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return data().fruit;
											},

											get value() {
												return data().value;
											},

											get color() {
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

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => scaleBand().paddingInner(0.4).paddingOuter(0.2));
		let $1 = $.derived(() => $.get(groupBy) ? scaleBand().padding(0.1) : undefined);

		let $2 = $.derived(() => $.get(groupBy)
			? unique($.get(data).map((d) => d[$.get(groupBy)]))
			: undefined);

		Chart(node_1, {
			get data() {
				return $.get(data);
			},
			x: 'year',
			get xScale() {
				return $.get($0);
			},
			y: 'values',
			yNice: true,
			c: 'fruit',
			get cDomain() {
				return colorKeys;
			},

			get cRange() {
				return fruitColors;
			},

			get x1() {
				return $.get(groupBy);
			},

			get x1Scale() {
				return $.get($1);
			},

			get x1Domain() {
				return $.get($2);
			},
			x1Range: ({ xScale }) => [0, xScale.bandwidth()],
			padding: { left: 32, bottom: 20, top: 8 },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}