import 'svelte/internal/disclose-version';
import { getFlare } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { hierarchy } from 'd3-hierarchy';
import { forceX, forceY, forceManyBody, forceLink } from 'd3-force';
import { Chart, Circle, Link, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { cls } from '@layerstack/tailwind';

const data = await getFlare();
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tree($$anchor, $$props) {
	$.push($$props, true);

	const root = hierarchy(data);
	const nodes = root.descendants();
	const links = root.links();
	const linkForce = forceLink(links).distance(0).strength(1);
	const chargeForce = forceManyBody().strength(-50);
	const xForce = forceX();
	const yForce = forceY();
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let nodes = () => ($$arg0?.()).nodes;
					let linkPositions = () => ($$arg0?.()).linkPositions;

					Layer($$anchor, {
						center: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_2 = $.first_child(fragment_3);

							$.each(node_2, 17, () => links, $.index, ($$anchor, link, i) => {
								Link($$anchor, $.spread_props(
									{
										get data() {
											return $.get(link);
										}
									},
									() => linkPositions()[i],
									{ class: 'stroke-surface-content/20' }
								));
							});

							var node_3 = $.sibling(node_2, 2);

							$.each(node_3, 17, nodes, (node) => [node.data.name, node.parent?.data?.name].join('-'), ($$anchor, node) => {
								{
									let $0 = $.derived(() => cls($.get(node)?.children
										? 'fill-surface-100 stroke-surface-content'
										: 'fill-surface-content'));

									Circle($$anchor, {
										get cx() {
											return $.get(node).x;
										},

										get cy() {
											return $.get(node).y;
										},
										r: 3,
										get class() {
											return $.get($0);
										},
										onpointermove: (e) => context().tooltip.show(e, $.get(node)),
										get onpointerleave() {
											return context().tooltip.hide;
										}
									});
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				let $0 = $.derived(() => ({ link: linkForce, charge: chargeForce, x: xForce, y: yForce }));
				let $1 = $.derived(() => ({ nodes, links }));

				ForceSimulation(node_1, {
					get forces() {
						return $.get($0);
					},

					get data() {
						return $.get($1);
					},
					cloneNodes: true,
					children,
					$$slots: { default: true }
				});
			}

			var node_4 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_6 = root_1();
					var node_5 = $.first_child(fragment_6);

					$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().data.name));
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

								{
									var consequent = ($$anchor) => {
										var fragment_9 = $.comment();
										var node_8 = $.first_child(fragment_9);

										$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												label: 'children',
												get value() {
													return data().children.length;
												}
											});
										});

										$.append($$anchor, fragment_9);
									};

									$.if(node_7, ($$render) => {
										if (data().children) $$render(consequent);
									});
								}

								var node_9 = $.sibling(node_7, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_10 = $.comment();
										var node_10 = $.first_child(fragment_10);

										$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
											Tooltip_Item_1($$anchor, {
												label: 'value',
												get value() {
													return data().data.value;
												},
												format: 'integer'
											});
										});

										$.append($$anchor, fragment_10);
									};

									$.if(node_9, ($$render) => {
										if (data().data.value) $$render(consequent_1);
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
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, { height: 600, children, $$slots: { default: true } });
	}

	return $.pop($$exports);
}