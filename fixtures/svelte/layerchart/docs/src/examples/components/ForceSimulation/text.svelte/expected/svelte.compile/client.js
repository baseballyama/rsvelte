import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { forceX, forceY, forceManyBody, forceCollide } from 'd3-force';
import { Chart, Layer, Points } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import ForceTextControls from '$lib/components/controls/ForceTextControls.svelte';
import { rasterizeText } from '$lib/utils/string.js';

var root = $.from_html(`<!> <!>`, 1);

export default function Text($$anchor, $$props) {
	$.push($$props, true);

	const collisionStrength = 0.01;
	let width = $.state(960);
	let height = $.state(500);
	let transition = false;

	let config = $.state($.proxy({
		text: 'LayerChart',
		fontSize: 124,
		spacing: 10,
		radius: 2,
		hasCollideForce: true,
		hasChargeForce: false
	}));

	const onResize = (e) => {
		$.set(width, e.width, true);
		$.set(height, e.height, true);
	};

	let mouseNode = $.derived(() => ({
		x: 0,
		y: $.get(height) / 2,
		xTarget: $.get(width),
		yTarget: $.get(height) / 2,
		rTarget: 100
	}));

	const textOptions = $.derived(() => ({
		fontSize: $.get(config).fontSize + 'px',
		spacing: $.get(config).spacing,
		width: $.get(width),
		height: $.get(height)
	}));

	const pixels = $.derived(() => rasterizeText($.get(config).text, $.get(textOptions)).map((d) => {
		return {
			x: transition ? d[0] : Math.random() * $.get(width),
			y: transition ? d[1] : Math.random() * $.get(height),
			xTarget: d[0],
			yTarget: d[1],
			rTarget: $.get(config).radius
		};
	}));

	const forceData = $.derived(() => [$.get(mouseNode), ...$.get(pixels)]);
	const xForce = forceX((d) => d.xTarget).strength(collisionStrength);
	const yForce = forceY((d) => d.yTarget).strength(collisionStrength);
	const collideForce = forceCollide().radius((d) => d.rTarget).iterations(3);
	const manyBodyForce = forceManyBody();
	var fragment = root();
	var node = $.first_child(fragment);

	ForceTextControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			{
				const children = ($$anchor, $$arg0) => {
					let nodes = () => ($$arg0?.()).nodes;
					let simulation = () => ($$arg0?.()).simulation;

					Layer($$anchor, {
						onpointermove: (e) => {
							simulation().nodes()[0].fx = e.offsetX;
							simulation().nodes()[0].fy = e.offsetY;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => nodes().slice(1));

								Points($$anchor, {
									get data() {
										return $.get($0);
									},

									get r() {
										return $.get(config).radius;
									},
									class: 'fill-primary'
								});
							}
						},
						$$slots: { default: true }
					});
				};

				let $0 = $.derived(() => ({
					x: xForce,
					y: yForce,
					...$.get(config).hasCollideForce && { collide: collideForce },
					...$.get(config).hasChargeForce && {
						charge: manyBodyForce.strength((d, i) => i ? 0 : -context().width * 2 / 10)
					}
				}));

				let $1 = $.derived(() => ({ nodes: $.get(forceData) }));

				ForceSimulation($$anchor, {
					get forces() {
						return $.get($0);
					},

					get data() {
						return $.get($1);
					},
					alphaTarget: 1,
					velocityDecay: 0.2,
					children,
					$$slots: { default: true }
				});
			}
		};

		Chart(node_1, {
			get data() {
				return $.get(forceData);
			},
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

	$.append($$anchor, fragment);
	$.pop();
}