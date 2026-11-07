import * as $ from 'svelte/internal/server';
import { hierarchy } from 'd3-hierarchy';
import { forceX, forceY, forceManyBody, forceLink } from 'd3-force';
import { Chart, Circle, Link, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { cls } from '@layerstack/tailwind';
import { getFlare } from '$lib/data.remote';

const data = await getFlare();

export default function Tree($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const root = hierarchy(data);
		const nodes = root.descendants();
		const links = root.links();
		const linkForce = forceLink(links).distance(0).strength(1);
		const chargeForce = forceManyBody().strength(-50);
		const xForce = forceX();
		const yForce = forceY();

		{
			function children($$renderer, { context }) {
				{
					function children($$renderer, { nodes, linkPositions }) {
						Layer($$renderer, {
							center: true,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(links);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let link = each_array[i];

									Link($$renderer, $.spread_props([
										{ data: link },
										linkPositions[i],
										{ class: 'stroke-surface-content/20' }
									]));
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_1 = $.ensure_array_like(nodes);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let node = each_array_1[$$index_1];

									Circle($$renderer, {
										cx: node.x,
										cy: node.y,
										r: 3,
										class: cls(node?.children
											? 'fill-surface-100 stroke-surface-content'
											: 'fill-surface-content'),
										onpointermove: (e) => context.tooltip.show(e, node),
										onpointerleave: context.tooltip.hide
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					}

					ForceSimulation($$renderer, {
						forces: { link: linkForce, charge: chargeForce, x: xForce, y: yForce },
						data: { nodes, links },
						cloneNodes: true,
						children,
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.data.name)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (data.children) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'children', value: data.children.length });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (data.data.value) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'value', value: data.data.value, format: 'integer' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, { height: 600, children, $$slots: { default: true } });
		}

		$.bind_props($$props, { data });
	});
}