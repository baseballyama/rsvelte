import * as $ from 'svelte/internal/server';
import { forceManyBody, forceLink, forceX, forceY } from 'd3-force';
import { curveLinear } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Chart, Circle, Link, Layer } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { getDisjointGraph } from '$lib/graph.remote.js';

const data = await getDisjointGraph();

export default function Disjoint_graph($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nodes = $.derived(() => data.nodes);
		const links = $.derived(() => data.links);
		const colorScale = scaleOrdinal(schemeCategory10);
		const linkForce = $.derived(() => forceLink(links()).id((d) => d.id));
		const chargeForce = forceManyBody().strength(-30).theta(0.9);
		const xForce = forceX();
		const yForce = forceY();

		function keyForLink(link) {
			return link.value + link.index;
		}

		Chart($$renderer, {
			height: 680,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						{
							function children($$renderer, { nodes, links, linkPositions }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(links);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let link = each_array[i];

									Link($$renderer, $.spread_props([
										{ data: link },
										linkPositions[i],
										{ class: 'stroke-surface-content/50', curve: curveLinear }
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
										fill: colorScale(node.group.toString())
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							ForceSimulation($$renderer, {
								forces: { link: linkForce(), charge: chargeForce, x: xForce, y: yForce },
								data: { nodes: nodes(), links: links() },
								children,
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}