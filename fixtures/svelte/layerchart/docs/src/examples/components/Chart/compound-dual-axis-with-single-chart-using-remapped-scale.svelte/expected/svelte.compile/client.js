import 'svelte/internal/disclose-version';
import { getNewPassengerCars } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
import { scaleLinear } from 'd3-scale';

const data = await getNewPassengerCars();
var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Compound_dual_axis_with_single_chart_using_remapped_scale($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, {
						placement: 'left',
						rule: true,
						format: 'metric',
						label: '↑ sales (M)',
						labelPlacement: 'start',
						labelProps: { class: 'fill-primary' }
					});

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => scaleLinear(context().y1Scale?.domain() ?? [], [context().height, 0]));
						let $1 = $.derived(() => context().y1Scale?.ticks?.());

						Axis(node_2, {
							placement: 'right',
							get scale() {
								return $.get($0);
							},

							get ticks() {
								return $.get($1);
							},
							rule: true,
							label: 'efficiency (mpg) ↑',
							labelPlacement: 'start',
							labelProps: { class: 'fill-secondary' }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					Axis(node_3, { placement: 'bottom', format: 'none', rule: true });

					var node_4 = $.sibling(node_3, 2);

					Spline(node_4, { class: 'stroke-2 stroke-primary' });

					var node_5 = $.sibling(node_4, 2);

					Spline(node_5, {
						y: (d) => context().y1Scale?.(d.efficiency),
						class: 'stroke-2 stroke-secondary'
					});

					var node_6 = $.sibling(node_5, 2);

					Highlight(node_6, { lines: true, points: true });

					var node_7 = $.sibling(node_6, 2);

					Highlight(node_7, {
						points: { class: 'fill-secondary' },
						y: (d) => context().y1Scale?.(d.efficiency)
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_1();
					var node_9 = $.first_child(fragment_3);

					$.component(node_9, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_11 = $.first_child(fragment_5);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'sales',
										get value() {
											return data().sales;
										},
										format: 'currencyRound'
									});
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'efficiency',
										get value() {
											return data().efficiency;
										}
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'year',
			y: 'sales',
			yDomain: [0, null],
			yNice: true,
			y1: 'efficiency',
			y1Range: ({ yScale }) => yScale.domain(),
			padding: { top: 24, bottom: 24, left: 24, right: 24 },
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}