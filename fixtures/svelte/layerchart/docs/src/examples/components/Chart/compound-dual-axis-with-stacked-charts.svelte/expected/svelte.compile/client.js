import 'svelte/internal/disclose-version';
import { getNewPassengerCars } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';

const data = await getNewPassengerCars();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-stack p-4 border rounded-sm"><!> <!></div>`);

export default function Compound_dual_axis_with_stacked_charts($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };
	var div = root_3();
	var node = $.child(div);

	Chart(node, {
		get data() {
			return data;
		},
		x: 'year',
		y: 'sales',
		yDomain: [0, null],
		yNice: true,
		padding: { top: 24, bottom: 24, left: 24, right: 24 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Axis(node_1, {
						placement: 'left',
						rule: true,
						format: 'metric',
						label: '↑ sales (M)',
						labelPlacement: 'start',
						labelProps: { class: 'fill-primary' }
					});

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', format: 'none', rule: true });

					var node_3 = $.sibling(node_2, 2);

					Spline(node_3, { class: 'stroke-2 stroke-primary' });

					var node_4 = $.sibling(node_3, 2);

					Highlight(node_4, { lines: true, points: true });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node, 2);

	Chart(node_5, {
		get data() {
			return data;
		},
		x: 'year',
		y: 'efficiency',
		padding: { top: 24, bottom: 24, left: 24, right: 24 },
		tooltipContext: { mode: 'quadtree-x' },
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_6 = $.first_child(fragment_2);

			Layer(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_7 = $.first_child(fragment_3);

					Axis(node_7, {
						placement: 'right',
						rule: true,
						label: 'efficiency (mpg) ↑',
						labelPlacement: 'start',
						labelProps: { class: 'fill-secondary' }
					});

					var node_8 = $.sibling(node_7, 2);

					Spline(node_8, { class: 'stroke-2 stroke-secondary' });

					var node_9 = $.sibling(node_8, 2);

					Highlight(node_9, { lines: true });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_6, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_2();
					var node_11 = $.first_child(fragment_4);

					$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_2();
								var node_13 = $.first_child(fragment_6);

								$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'sales',
										get value() {
											return data().sales;
										},
										format: 'currencyRound'
									});
								});

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'efficiency',
										get value() {
											return data().efficiency;
										}
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_10, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}