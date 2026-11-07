import * as $ from 'svelte/internal/server';
import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';
import { Chart, Layer, Points } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import ForceTextControls from '$lib/components/controls/ForceTextControls.svelte';
import { rasterizeText } from '$lib/utils/string.js';

export default function Text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const collisionStrength = 0.01;
		let width = 960;
		let height = 500;
		let transition = false;

		let config = {
			text: 'LayerChart',
			fontSize: 124,
			spacing: 10,
			radius: 2,
			hasCollideForce: true,
			hasChargeForce: false
		};

		const onResize = (e) => {
			width = e.width;
			height = e.height;
		};

		let mouseNode = $.derived(() => ({
			x: 0,
			y: height / 2,
			xTarget: width,
			yTarget: height / 2,
			rTarget: 100
		}));

		const textOptions = $.derived(() => ({
			fontSize: config.fontSize + 'px',
			spacing: config.spacing,
			width,
			height
		}));

		const pixels = $.derived(() => rasterizeText(config.text, textOptions()).map((d) => {
			return {
				x: transition ? d[0] : Math.random() * width,
				y: transition ? d[1] : Math.random() * height,
				xTarget: d[0],
				yTarget: d[1],
				rTarget: config.radius
			};
		}));

		const forceData = $.derived(() => [mouseNode(), ...pixels()]);
		const xForce = forceX((d) => d.xTarget).strength(collisionStrength);
		const yForce = forceY((d) => d.yTarget).strength(collisionStrength);
		const collideForce = forceCollide().radius((d) => d.rTarget).iterations(3);
		const manyBodyForce = forceManyBody();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ForceTextControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					{
						function children($$renderer, { nodes, simulation }) {
							Layer($$renderer, {
								onpointermove: (e) => {
									simulation.nodes()[0].fx = e.offsetX;
									simulation.nodes()[0].fy = e.offsetY;
								},

								children: ($$renderer) => {
									Points($$renderer, {
										data: nodes.slice(1),
										r: config.radius,
										class: 'fill-primary'
									});
								},
								$$slots: { default: true }
							});
						}

						ForceSimulation($$renderer, {
							forces: {
								x: xForce,
								y: yForce,
								...config.hasCollideForce && { collide: collideForce },
								...config.hasChargeForce && {
									charge: manyBodyForce.strength((d, i) => i ? 0 : -context.width * 2 / 10)
								}
							},
							data: { nodes: forceData() },
							alphaTarget: 1,
							velocityDecay: 0.2,
							children,
							$$slots: { default: true }
						});
					}
				}

				Chart($$renderer, {
					data: forceData(),
					x: 'x',
					xDomain: [0, 1],
					xRange: [0, 1],
					y: 'y',
					yDomain: [0, 1],
					yRange: [0, 1],
					onResize,
					height: 500,
					clip: true,
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}