import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleThreshold } from 'd3-scale';
import { range } from 'd3-array';
import { Calendar, Chart, Group, Layer, Text, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { endOfInterval } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Multiple_years($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map((d) => {
		return {
			...d,
			value: Math.random() > 0.2 ? d.value : null // set null for some values
		};
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleThreshold().unknown('transparent'));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			c: 'value',
			get cScale() {
				return $.get($0);
			},
			cDomain: [25, 50, 75],
			cRange: [
				'var(--color-primary-100)',
				'var(--color-primary-300)',
				'var(--color-primary-500)',
				'var(--color-primary-700)'
			],
			padding: { top: 20, left: 20 },
			height: 450,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 17, () => range(2021, 2024), $.index, ($$anchor, year, i) => {
							const start = $.derived(() => new Date($.get(year), 0, 1));
							const end = $.derived(() => endOfInterval('year', $.get(start)));

							Group($$anchor, {
								y: 140 * i,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_2 = $.first_child(fragment_4);

									Text(node_2, {
										get value() {
											return $.get(year);
										},
										class: 'text-xs',
										rotate: 270,
										x: -20,
										y: 16 * 7 / 2,
										textAnchor: 'middle',
										verticalAnchor: 'start'
									});

									var node_3 = $.sibling(node_2, 2);

									Calendar(node_3, {
										get start() {
											return $.get(start);
										},

										get end() {
											return $.get(end);
										},
										tooltip: true,
										cellSize: 16,
										monthPath: true
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_5 = root();
						var node_5 = $.first_child(fragment_5);

						$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().date;
								},
								format: 'day'
							});
						});

						var node_6 = $.sibling(node_5, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_6 = $.comment();
								var node_7 = $.first_child(fragment_6);

								$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
									Tooltip_List($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = $.comment();
											var node_8 = $.first_child(fragment_7);

											$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, {
													label: 'value',
													get value() {
														return data().value;
													},
													format: 'integer',
													valueAlign: 'right'
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							};

							$.if(node_6, ($$render) => {
								if (data().value != null) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_5);
					};

					$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}