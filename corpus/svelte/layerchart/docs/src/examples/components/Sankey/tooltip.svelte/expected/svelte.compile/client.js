import 'svelte/internal/disclose-version';
import { getGreenhouseGraph } from '$lib/graph.remote';
import * as $ from 'svelte/internal/client';
import { Icon } from 'svelte-ux';
import LucideArrowRight from '~icons/lucide/arrow-right';
import { Chart, Group, Link, Rect, Layer, Text, Tooltip } from 'layerchart';
import { Sankey } from 'layerchart/graph';

const data = await getGreenhouseGraph();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!> `, 1);
var root_2 = $.from_html(`<!> <div class="col-span-full text-sm">Sources</div> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="col-span-full text-sm">Targets</div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Tooltip_1($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let links = () => ($$arg0?.()).links;
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							$.each(node_2, 17, links, (link) => [link.value, link.source.name, link.target.name].join('-'), ($$anchor, link) => {
								Link($$anchor, {
									sankey: true,
									get data() {
										return $.get(link);
									},

									get strokeWidth() {
										return $.get(link).width;
									},
									class: 'stroke-surface-content/10',
									onpointermove: (e) => context().tooltip.show(e, { link: $.get(link) }),
									onpointerleave: () => context().tooltip.hide()
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.each(node_3, 17, nodes, (node) => node.name, ($$anchor, node) => {
								const nodeWidth = $.derived(() => ($.get(node).x1 ?? 0) - ($.get(node).x0 ?? 0));
								const nodeHeight = $.derived(() => ($.get(node).y1 ?? 0) - ($.get(node).y0 ?? 0));

								Group($$anchor, {
									get x() {
										return $.get(node).x0;
									},

									get y() {
										return $.get(node).y0;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_4 = $.first_child(fragment_6);

										Rect(node_4, {
											get width() {
												return $.get(nodeWidth);
											},

											get height() {
												return $.get(nodeHeight);
											},
											class: 'fill-primary',
											onpointermove: (e) => context().tooltip.show(e, { node: $.get(node) }),
											onpointerleave: () => context().tooltip.hide()
										});

										var node_5 = $.sibling(node_4, 2);

										{
											let $0 = $.derived(() => $.get(node).height === 0 ? -4 : $.get(nodeWidth) + 4);
											let $1 = $.derived(() => $.get(nodeHeight) / 2);
											let $2 = $.derived(() => $.get(node).height === 0 ? 'end' : 'start');

											Text(node_5, {
												get value() {
													return $.get(node).name;
												},

												get x() {
													return $.get($0);
												},

												get y() {
													return $.get($1);
												},

												get textAnchor() {
													return $.get($2);
												},
												verticalAnchor: 'middle',
												class: 'pointer-events-none'
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						Sankey($$anchor, {
							nodeId: (d) => d.name,
							nodeWidth: 8,
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_7 = root();
					var node_7 = $.first_child(fragment_7);

					$.component(node_7, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = $.comment();
								var node_8 = $.first_child(fragment_8);

								{
									var consequent = ($$anchor) => {
										var text = $.text();

										$.template_effect(() => $.set_text(text, data().node.name));
										$.append($$anchor, text);
									};

									var consequent_1 = ($$anchor) => {
										var fragment_10 = root_1();
										var text_1 = $.first_child(fragment_10);
										var node_9 = $.sibling(text_1);

										Icon(node_9, {
											get data() {
												return LucideArrowRight;
											},
											class: 'text-white/50'
										});

										var text_2 = $.sibling(node_9);

										$.template_effect(() => {
											$.set_text(text_1, `${data().link.source.name ?? ''} `);
											$.set_text(text_2, ` ${data().link.target.name ?? ''}`);
										});

										$.append($$anchor, fragment_10);
									};

									$.if(node_8, ($$render) => {
										if (data().node) $$render(consequent); else if (data().link) $$render(consequent_1, 1);
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					var node_10 = $.sibling(node_7, 2);

					$.component(node_10, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_11 = $.comment();
								var node_11 = $.first_child(fragment_11);

								{
									var consequent_4 = ($$anchor) => {
										var fragment_12 = root_4();
										var node_12 = $.first_child(fragment_12);

										$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												label: 'Total',
												get value() {
													return data().node.value;
												},
												format: 'decimal'
											});
										});

										var node_13 = $.sibling(node_12, 2);

										{
											var consequent_2 = ($$anchor) => {
												var fragment_13 = root_2();
												var node_14 = $.first_child(fragment_13);

												$.component(node_14, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
													Tooltip_Separator($$anchor, {});
												});

												var node_15 = $.sibling(node_14, 4);

												$.each(node_15, 17, () => data().node.targetLinks, $.index, ($$anchor, link) => {
													var fragment_14 = $.comment();
													var node_16 = $.first_child(fragment_14);

													$.component(node_16, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
														Tooltip_Item_1($$anchor, {
															get label() {
																return $.get(link).source.name;
															},

															get value() {
																return $.get(link).value;
															},
															format: 'decimal'
														});
													});

													$.append($$anchor, fragment_14);
												});

												$.append($$anchor, fragment_13);
											};

											$.if(node_13, ($$render) => {
												if (data().node.targetLinks.length) $$render(consequent_2);
											});
										}

										var node_17 = $.sibling(node_13, 2);

										{
											var consequent_3 = ($$anchor) => {
												var fragment_15 = root_3();
												var node_18 = $.first_child(fragment_15);

												$.component(node_18, () => Tooltip.Separator, ($$anchor, Tooltip_Separator_1) => {
													Tooltip_Separator_1($$anchor, {});
												});

												var node_19 = $.sibling(node_18, 4);

												$.each(node_19, 17, () => data().node.sourceLinks, $.index, ($$anchor, link) => {
													var fragment_16 = $.comment();
													var node_20 = $.first_child(fragment_16);

													$.component(node_20, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
														Tooltip_Item_2($$anchor, {
															get label() {
																return $.get(link).target.name;
															},

															get value() {
																return $.get(link).value;
															},
															format: 'decimal'
														});
													});

													$.append($$anchor, fragment_16);
												});

												$.append($$anchor, fragment_15);
											};

											$.if(node_17, ($$render) => {
												if (data().node.sourceLinks.length) $$render(consequent_3);
											});
										}

										$.append($$anchor, fragment_12);
									};

									var consequent_5 = ($$anchor) => {
										var fragment_17 = $.comment();
										var node_21 = $.first_child(fragment_17);

										$.component(node_21, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
											Tooltip_Item_3($$anchor, {
												label: 'Value',
												get value() {
													return data().link.value;
												},
												format: 'decimal'
											});
										});

										$.append($$anchor, fragment_17);
									};

									$.if(node_11, ($$render) => {
										if (data().node) $$render(consequent_4); else if (data().link) $$render(consequent_5, 1);
									});
								}

								$.append($$anchor, fragment_11);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				};

				$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			flatData: [],
			height: 600,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}