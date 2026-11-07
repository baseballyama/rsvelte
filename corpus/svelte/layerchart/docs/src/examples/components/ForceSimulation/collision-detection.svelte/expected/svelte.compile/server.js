import * as $ from 'svelte/internal/server';
import { scaleOrdinal } from 'd3-scale';
import { randomUniform } from 'd3-random';
import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';
import { Chart, Circle, Group, Layer } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

export default function Collision_detection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const k = 600 / 200;
		const r = randomUniform(k, k * 4);
		const n = 4;
		const data = Array.from({ length: 200 }, (_, i) => ({ r: r(), group: i && i % n + 1 }));

		const groupColor = scaleOrdinal([
			'var(--color-info)',
			'var(--color-warning)',
			'var(--color-danger)'
		]);

		const xForce = forceX().strength(0.01);
		const yForce = forceY().strength(0.01);
		const collideForce = forceCollide().radius((d) => d.r + 1).iterations(3);
		const manyBodyForce = forceManyBody();

		{
			function children($$renderer, { context }) {
				{
					function children($$renderer, { nodes, simulation }) {
						Layer($$renderer, {
							onpointermove: (e) => {
								simulation.nodes()[0].fx = e.offsetX - context.width / 2;
								simulation.nodes()[0].fy = e.offsetY - context.height / 2;
							},

							children: ($$renderer) => {
								Group($$renderer, {
									center: true,
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(nodes);

										for (let i = 0, $$length = each_array.length; i < $$length; i++) {
											let node = each_array[i];

											if (i > 0) {
												$$renderer.push('<!--[0-->');

												Circle($$renderer, {
													cx: node.x,
													cy: node.y,
													r: node.r,
													fill: groupColor(node.group.toString())
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}

					ForceSimulation($$renderer, {
						forces: {
							x: xForce,
							y: yForce,
							collide: collideForce,
							charge: manyBodyForce.strength((d, i) => i ? 0 : -context.width * 2 / 3)
						},
						data: { nodes: data },
						alphaTarget: 0.3,
						velocityDecay: 0.1,
						children,
						$$slots: { default: true }
					});
				}
			}

			Chart($$renderer, {
				height: 600,
				clip: true,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}