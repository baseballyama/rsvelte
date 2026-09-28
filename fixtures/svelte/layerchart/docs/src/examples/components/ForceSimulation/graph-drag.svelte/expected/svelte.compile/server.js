import * as $ from 'svelte/internal/server';
import { forceManyBody, forceLink, forceCenter } from 'd3-force';
import { curveLinear } from 'd3-shape';
import StickyControl from '$lib/components/controls/ForceSimluationControls2.svelte';
import { Chart, Link, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { cls } from '@layerstack/tailwind';
import { clamp } from '@layerstack/utils';
import { movable } from '$lib/actions/movable.js';

export default function Graph_drag($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nodes = Array.from({ length: 13 }, (_, i) => ({ id: i }));

		const links = [
			{ source: 0, target: 1 },
			{ source: 1, target: 2 },
			{ source: 2, target: 0 },
			{ source: 1, target: 3 },
			{ source: 3, target: 2 },
			{ source: 3, target: 4 },
			{ source: 4, target: 5 },
			{ source: 5, target: 6 },
			{ source: 5, target: 7 },
			{ source: 6, target: 7 },
			{ source: 6, target: 8 },
			{ source: 7, target: 8 },
			{ source: 9, target: 4 },
			{ source: 9, target: 11 },
			{ source: 9, target: 10 },
			{ source: 10, target: 11 },
			{ source: 11, target: 12 },
			{ source: 12, target: 10 }
		];

		const data = nodes; // For export compatibility
		const linkForce = forceLink(links);
		const chargeForce = forceManyBody();
		const centerForce = forceCenter();
		let sticky = true;
		let dragging = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			StickyControl($$renderer, {
				get sticky() {
					return sticky;
				},

				set sticky($$value) {
					sticky = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { nodes, simulation, linkPositions }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(links);

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let link = each_array[i];

										Link($$renderer, $.spread_props([
											{ data: link },
											linkPositions[i],
											{ curve: curveLinear, class: 'stroke-surface-content/20' }
										]));
									}

									$$renderer.push(`<!--]--><!--[-->`);

									const each_array_1 = $.ensure_array_like(nodes);

									for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
										let node = each_array_1[i];
										const thisNode = simulation.nodes()[i];

										$$renderer.push(`<circle${$.attr('cx', node.x)}${$.attr('cy', node.y)}${$.attr('r', 12)}${$.attr_class($.clsx(cls('cursor-all-scroll', node.fx ? 'fill-primary' : 'fill-surface-content')))}></circle>`);
									}

									$$renderer.push(`<!--]-->`);
								}

								ForceSimulation($$renderer, {
									forces: {
										link: linkForce,
										charge: chargeForce,
										center: centerForce.x(context.width / 2).y(context.height / 2)
									},
									data: { nodes, links },
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(context.tooltip.data?.id)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				Chart($$renderer, { height: 600, children, $$slots: { default: true } });
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}