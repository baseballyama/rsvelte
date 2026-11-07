import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { randomUniform } from 'd3-random';
import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';
import { Chart, Circle, Group, Layer } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

export default function Collision_detection($$anchor, $$props) {
	$.push($$props, true);

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
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const children = ($$anchor, $$arg0) => {
					let nodes = () => ($$arg0?.()).nodes;
					let simulation = () => ($$arg0?.()).simulation;

					Layer($$anchor, {
						onpointermove: (e) => {
							simulation().nodes()[0].fx = e.offsetX - context().width / 2;
							simulation().nodes()[0].fy = e.offsetY - context().height / 2;
						},

						children: ($$anchor, $$slotProps) => {
							Group($$anchor, {
								center: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_1 = $.first_child(fragment_4);

									$.each(node_1, 17, nodes, $.index, ($$anchor, node, i) => {
										var fragment_5 = $.comment();
										var node_2 = $.first_child(fragment_5);

										{
											var consequent = ($$anchor) => {
												{
													let $0 = $.derived(() => groupColor($.get(node).group.toString()));

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
															return $.get($0);
														}
													});
												}
											};

											$.if(node_2, ($$render) => {
												if (i > 0) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_5);
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				};

				let $0 = $.derived(() => ({
					x: xForce,
					y: yForce,
					collide: collideForce,
					charge: manyBodyForce.strength((d, i) => i ? 0 : -context().width * 2 / 3)
				}));

				let $1 = $.derived(() => ({ nodes: data }));

				ForceSimulation($$anchor, {
					get forces() {
						return $.get($0);
					},

					get data() {
						return $.get($1);
					},
					alphaTarget: 0.3,
					velocityDecay: 0.1,
					children,
					$$slots: { default: true }
				});
			}
		};

		Chart($$anchor, {
			height: 600,
			clip: true,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}