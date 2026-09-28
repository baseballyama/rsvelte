import 'svelte/internal/disclose-version';
import { getGamesLayoffs } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { scaleSqrt } from 'd3-scale';
import { forceX, forceY, forceCollide } from 'd3-force';
import { asAny, Axis, Chart, Circle, Layer, Text, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

const data = await getGamesLayoffs();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Games_industry_layoffs($$anchor, $$props) {
	$.push($$props, true);

	// Colors mirror the original Observable notebook (yellow→orange→red as years progress).
	const yearColor = { 2022: '#facc42', 2023: '#f09855', 2024: '#e74e45' };

	const unknownColor = '#cccccc';
	const radiusScale = scaleSqrt().domain([0, 5000]).range([4, 28]);
	const labelThreshold = 500;
	const nodes = $.derived(() => data.map((d) => ({ ...d, r: d.headcount != null ? radiusScale(d.headcount) : 6 })));
	const xForce = forceX().strength(0.95);
	const yForce = forceY().strength(0.06);
	const collideForce = forceCollide().radius((d) => d.r + 1);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, {
						placement: 'bottom',
						rule: true,
						grid: true,
						format: (d) => d.getUTCFullYear().toString()
					});

					var node_3 = $.sibling(node_2, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, nodes, $.index, ($$anchor, node) => {
								const year = $.derived(() => $.get(node).date.getUTCFullYear());
								const color = $.derived(() => $.get(node).headcount == null ? unknownColor : yearColor[$.get(year)] ?? unknownColor);

								{
									let $0 = $.derived(() => $.get(node).headcount == null ? 0.5 : 1);

									Circle($$anchor, {
										get cx() {
											return $.get(node).x;
										},

										get cy() {
											return $.get(node).y;
										},

										get r() {
											return $.get(node).r;
										},

										get fill() {
											return $.get(color);
										},

										get fillOpacity() {
											return $.get($0);
										},
										stroke: 'var(--color-surface-100)',
										onpointermove: (e) => context().tooltip.show(e, $.get(node)),
										get onpointerleave() {
											return context().tooltip.hide;
										}
									});
								}
							});

							var node_5 = $.sibling(node_4, 2);

							$.each(node_5, 17, () => nodes().filter((n) => n.headcount != null && n.headcount >= labelThreshold), $.index, ($$anchor, node) => {
								{
									let $0 = $.derived(() => Math.min(11, $.get(node).r * 0.6));

									Text($$anchor, {
										get x() {
											return $.get(node).x;
										},

										get y() {
											return $.get(node).y;
										},

										get value() {
											return $.get(node).studio;
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										get fontSize() {
											return $.get($0);
										},
										stroke: 'var(--color-surface-100)',
										strokeWidth: 2,
										class: 'pointer-events-none'
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						let $0 = $.derived(() => ({
							x: xForce.x((d) => context().xGet(asAny(d))),
							y: yForce.y(context().height / 2),
							collide: collideForce
						}));

						let $1 = $.derived(() => ({ nodes: $.get(nodes) }));

						ForceSimulation(node_3, {
							get forces() {
								return $.get($0);
							},

							get data() {
								return $.get($1);
							},
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = root();
					var node_7 = $.first_child(fragment_6);

					$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().studio));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_1();
								var node_9 = $.first_child(fragment_8);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Date',
										get value() {
											return data().date;
										},
										format: 'day'
									});
								});

								var node_10 = $.sibling(node_9, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_9 = $.comment();
										var node_11 = $.first_child(fragment_9);

										$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
											Tooltip_Item_1($$anchor, {
												label: 'Headcount',
												get value() {
													return data().headcount;
												},
												format: 'integer'
											});
										});

										$.append($$anchor, fragment_9);
									};

									var alternate = ($$anchor) => {
										var fragment_10 = $.comment();
										var node_12 = $.first_child(fragment_10);

										$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
											Tooltip_Item_2($$anchor, { label: 'Headcount', value: 'Unknown' });
										});

										$.append($$anchor, fragment_10);
									};

									$.if(node_10, ($$render) => {
										if (data().headcount != null) $$render(consequent); else $$render(alternate, -1);
									});
								}

								var node_13 = $.sibling(node_10, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_11 = $.comment();
										var node_14 = $.first_child(fragment_11);

										$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
											Tooltip_Item_3($$anchor, {
												label: 'Parent',
												get value() {
													return data().parent;
												}
											});
										});

										$.append($$anchor, fragment_11);
									};

									$.if(node_13, ($$render) => {
										if (data().parent) $$render(consequent_1);
									});
								}

								var node_15 = $.sibling(node_13, 2);

								{
									var consequent_2 = ($$anchor) => {
										var fragment_12 = $.comment();
										var node_16 = $.first_child(fragment_12);

										$.component(node_16, () => Tooltip.Item, ($$anchor, Tooltip_Item_4) => {
											Tooltip_Item_4($$anchor, {
												label: 'Type',
												get value() {
													return data().type;
												}
											});
										});

										$.append($$anchor, fragment_12);
									};

									$.if(node_15, ($$render) => {
										if (data().type) $$render(consequent_2);
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
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
			x: 'date',
			xNice: true,
			padding: { top: 12, bottom: 28, left: 12, right: 12 },
			height: 420,
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}