import * as $ from 'svelte/internal/server';
import { forceManyBody, forceLink } from 'd3-force';
import { curveLinear } from 'd3-shape';
import { Chart, Circle, Link, Layer } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

export default function Lattice($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Generate lattice grid data
		const n = 20;

		const nodes = Array.from({ length: n * n }, (_, i) => ({ index: i }));
		const links = [];

		for (let y = 0; y < n; ++y) {
			for (let x = 0; x < n; ++x) {
				if (y > 0) links.push({ source: (y - 1) * n + x, target: y * n + x });
				if (x > 0) links.push({ source: y * n + (x - 1), target: y * n + x });
			}
		}

		const data = nodes; // For export compatibility
		const chargeForce = forceManyBody().strength(-20);
		const linkForce = forceLink(links).strength(1).distance(20).iterations(10);

		Chart($$renderer, {
			height: 800,
			children: ($$renderer) => {
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
										linkPositions[i],
										{
											data: link,
											class: 'stroke-surface-content/20',
											curve: curveLinear
										}
									]));
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_1 = $.ensure_array_like(nodes);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let node = each_array_1[$$index_1];

									Circle($$renderer, { cx: node.x, cy: node.y, r: 3, class: 'fill-surface-content' });
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					}

					ForceSimulation($$renderer, {
						data: { nodes, links },
						forces: { charge: chargeForce, link: linkForce },
						children,
						$$slots: { default: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}