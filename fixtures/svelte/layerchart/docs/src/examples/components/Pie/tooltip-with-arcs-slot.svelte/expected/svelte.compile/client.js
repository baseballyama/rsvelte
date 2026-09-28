import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sum } from 'd3-array';
import { cls } from '@layerstack/tailwind';
import { format } from '@layerstack/utils';
import { Arc, Chart, Group, Layer, Pie, Text, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Tooltip_with_arcs_slot($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const dataSum = $.derived(() => sum(data, (d) => d.value));

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	const keyClasses = [
		{ shape: 'fill-info', content: 'fill-info-content' },
		{ shape: 'fill-success', content: 'fill-success-content' },
		{ shape: 'fill-warning', content: 'fill-warning-content' },
		{ shape: 'fill-danger', content: 'fill-danger-content' }
	];

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Layer(node, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let arcs = () => ($$arg0?.()).arcs;
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, arcs, $.index, ($$anchor, arc, index) => {
								const colors = $.derived(() => keyClasses[index]);
								const isHighlighted = $.derived(() => context().tooltip.data?.date === $.get(arc).data.date);
								const isFaded = $.derived(() => context().tooltip.data != null && context().tooltip.data.date !== $.get(arc).data.date);

								{
									let $0 = $.derived(() => cls($.get(isFaded) && 'opacity-50'));

									Group($$anchor, {
										onpointerenter: (e) => context().tooltip.show(e, $.get(arc).data),
										onpointermove: (e) => context().tooltip.show(e, $.get(arc).data),
										onpointerleave: (e) => context().tooltip.hide(),
										preventTouchMove: true,
										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											{
												const children = ($$anchor, $$arg0) => {
													let getArcTextProps = () => ($$arg0?.()).getArcTextProps;

													{
														let $0 = $.derived(() => format($.get(arc).data.value / $.get(dataSum), 'percent'));
														let $1 = $.derived(() => getArcTextProps()('centroid'));
														let $2 = $.derived(() => cls('text-base', $.get(colors).content));

														Text($$anchor, $.spread_props(
															{
																get value() {
																	return $.get($0);
																}
															},
															() => $.get($1),
															{
																get class() {
																	return $.get($2);
																}
															}
														));
													}
												};

												let $0 = $.derived(() => $.get(isHighlighted) ? 16 : 0);

												Arc($$anchor, {
													get startAngle() {
														return $.get(arc).startAngle;
													},

													get endAngle() {
														return $.get(arc).endAngle;
													},

													get padAngle() {
														return $.get(arc).padAngle;
													},

													get class() {
														return $.get(colors).shape;
													},

													get offset() {
														return $.get($0);
													},
													children,
													$$slots: { default: true }
												});
											}
										},
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						Pie($$anchor, { children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_7 = root();
					var node_3 = $.first_child(fragment_7);

					$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							get value() {
								return data().date;
							},
							format: 'day'
						});
					});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root();
								var node_5 = $.first_child(fragment_8);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'value',
										get value() {
											return data().value;
										},
										format: 'integer',
										valueAlign: 'right'
									});
								});

								var node_6 = $.sibling(node_5, 2);

								{
									let $0 = $.derived(() => data().value / $.get(dataSum));

									$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'percent',
											get value() {
												return $.get($0);
											},
											format: 'percent',
											valueAlign: 'right'
										});
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				};

				$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			c: 'date',
			get cRange() {
				return keyColors;
			},
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}