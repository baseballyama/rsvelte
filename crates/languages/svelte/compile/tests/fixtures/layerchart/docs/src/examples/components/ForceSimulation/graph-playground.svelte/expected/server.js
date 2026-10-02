import * as $ from 'svelte/internal/server';
import { forceCollide, forceManyBody, forceLink, forceCenter } from 'd3-force';
import { curveLinear } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Chart, Circle, Link, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import ForceGraphControls from '$lib/components/controls/ForceGraphPlaygroundControls.svelte';
import { getMiserablesGraph } from '$lib/graph.remote';

const data = await getMiserablesGraph();

export default function Graph_playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const nodes = data.nodes;
		const links = data.links;
		const colorScale = scaleOrdinal(schemeCategory10);

		let config = {
			isStopped: false,
			isStatic: false,
			alpha: 1,
			alphaTarget: 0,
			running: false,
			nodeRadius: 3,
			nodeStrokeWidth: 0,
			linkWidth: 1,
			linkOpacity: 0.5,
			hasLinkForce: true,
			hasChargeForce: true,
			hasCollideForce: true,
			hasCenterForce: true,
			linkDistance: 30,
			chargeDistanceMin: 1,
			chargeDistanceMax: 1000,
			chargeStrength: -30,
			collideRadius: 3,
			collideStrength: 1,
			centerStrength: 1.0
		};

		// Separate alpha variable for binding to ForceSimulation
		let alpha = 1;

		// Sync alpha with config.alpha (both ways)
		const linkForce = $.derived(() => forceLink(links).id((d) => d.id));

		const chargeForce = forceManyBody();
		const collideForce = forceCollide();
		const centerForce = forceCenter(0, 0);

		function handleStart() {
			config.running = true;
		}

		function handleTick(e) {
			// If we weren't already using `bind:alpha`, then this is
			// where we would get access to the current values of
			// `alpha` and `alphaTarget` and could make adjustments accordingly.
		}

		function handleEnd() {
			config.running = false;
		}

		function reheatSimulation(args = {}) {
			const _ = args;

			alpha = 1.0;
			config.alpha = 1.0;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ForceGraphControls($$renderer, {
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
					Layer($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, { nodes, linkPositions }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(links);

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let link = each_array[i];

										Link($$renderer, $.spread_props([
											{ data: link },
											linkPositions[i],
											{
												class: 'stroke-surface-content',
												curve: curveLinear,
												'stroke-width': config.linkWidth,
												opacity: config.linkOpacity
											}
										]));
									}

									$$renderer.push(`<!--]--> <!--[-->`);

									const each_array_1 = $.ensure_array_like(nodes);

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let node = each_array_1[$$index_1];

										Circle($$renderer, {
											cx: node.x,
											cy: node.y,
											r: config.nodeRadius,
											fill: colorScale(node.group.toString()),
											'stroke-width': config.nodeStrokeWidth,
											class: 'stroke-surface-content',
											onpointermove: (e) => context.tooltip.show(e, node),
											onpointerleave: context.tooltip.hide
										});
									}

									$$renderer.push(`<!--]-->`);
								}

								ForceSimulation($$renderer, {
									forces: {
										...config.hasLinkForce && { link: linkForce() },
										...config.hasChargeForce && { charge: chargeForce },
										...config.hasCollideForce && { collide: collideForce },
										...config.hasCenterForce && {
											center: centerForce.x(context.width / 2).y(context.height / 2)
										}
									},
									alphaTarget: config.alphaTarget,
									stopped: config.isStopped,
									static: config.isStatic,
									onStart: handleStart,
									onTick: handleTick,
									onEnd: handleEnd,
									data: { nodes, links },
									get alpha() {
										return alpha;
									},

									set alpha($$value) {
										alpha = $$value;
										$$settled = false;
									},
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