import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Axis,
	Chart,
	Layer,
	Highlight,
	Points,
	Rule,
	Tooltip,
	defaultChartPadding
} from 'layerchart';

import { Duration } from 'svelte-ux';
import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';
import { createTimeSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Multiple_overlapping_durations($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		...createTimeSeries({
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		}),

		...createTimeSeries({
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		})
	];

	let settings = $.state($.proxy({
		mode: 'bounds',
		highlight: ['area'],
		axis: 'both',
		snapToDataX: false,
		snapToDataY: false,
		debug: false
	}));

	var $$exports = { data };
	var fragment = root_2();
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
		let $1 = $.derived(() => defaultChartPadding({ left: 36, bottom: 36, right: 20 }));

		Chart(node_1, {
			get data() {
				return data;
			},
			x: ['startDate', 'endDate'],
			y: 'name',
			xNice: true,
			get tooltipContext() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_2 = $.first_child(fragment_1);

				Layer(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_3 = $.first_child(fragment_2);

						Axis(node_3, { placement: 'left', grid: { dashArray: 2 }, rule: true });

						var node_4 = $.sibling(node_3, 2);

						Axis(node_4, { placement: 'bottom' });

						var node_5 = $.sibling(node_4, 2);

						Rule(node_5, {});

						var node_6 = $.sibling(node_5, 2);

						Points(node_6, { class: 'fill-primary' });

						var node_7 = $.sibling(node_6, 2);

						{
							let $0 = $.derived(() => $.get(settings).highlight.includes('points'));
							let $1 = $.derived(() => $.get(settings).highlight.includes('lines'));
							let $2 = $.derived(() => $.get(settings).highlight.includes('area'));

							Highlight(node_7, {
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

				var node_8 = $.sibling(node_2, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_3 = root_2();
						var node_9 = $.first_child(fragment_3);

						$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

						var node_10 = $.sibling(node_9, 2);

						$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_11 = $.first_child(fragment_5);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'start',
											get value() {
												return data().startDate;
											},
											format: { type: 'time', options: { variant: 'short' } }
										});
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'end',
											get value() {
												return data().endDate;
											},
											format: { type: 'time', options: { variant: 'short' } }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
										Tooltip_Separator($$anchor, {});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
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
													}
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					};

					let $0 = $.derived(() => $.get(settings).snapToDataX ? 'data' : 'pointer');
					let $1 = $.derived(() => $.get(settings).snapToDataY ? 'data' : 'pointer');

					$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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