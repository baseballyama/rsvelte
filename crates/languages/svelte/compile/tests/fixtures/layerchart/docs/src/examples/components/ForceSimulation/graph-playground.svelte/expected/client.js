import 'svelte/internal/disclose-version';
import { getMiserablesGraph } from '$lib/graph.remote';
import * as $ from 'svelte/internal/client';
import { forceCollide, forceManyBody, forceLink, forceCenter } from 'd3-force';
import { curveLinear } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Chart, Circle, Link, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import ForceGraphControls from '$lib/components/controls/ForceGraphPlaygroundControls.svelte';

const data = await getMiserablesGraph();
var root = $.from_html(`<!> <!>`, 1);

export default function Graph_playground($$anchor, $$props) {
	$.push($$props, true);

	const nodes = data.nodes;
	const links = data.links;
	const colorScale = scaleOrdinal(schemeCategory10);

	let config = $.state($.proxy({
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
	}));

	// Separate alpha variable for binding to ForceSimulation
	let alpha = $.state(1);

	// Sync alpha with config.alpha (both ways)
	$.user_effect(() => {
		if ($.get(alpha) !== $.get(config).alpha) {
			$.get(config).alpha = $.get(alpha);
		}
	});

	$.user_effect(() => {
		if ($.get(config).alpha !== $.get(alpha)) {
			$.set(alpha, $.get(config).alpha, true);
		}
	});

	$.user_pre_effect(() => {
		reheatSimulation({
			hasLinkForce: $.get(config).hasLinkForce,
			hasChargeForce: $.get(config).hasChargeForce,
			hasCollideForce: $.get(config).hasCollideForce,
			hasCenterForce: $.get(config).hasCenterForce
		});
	});

	const linkForce = $.derived(() => forceLink(links).id((d) => d.id));
	const chargeForce = forceManyBody();
	const collideForce = forceCollide();
	const centerForce = forceCenter(0, 0);

	$.user_effect(() => {
		reheatSimulation();
		$.get(linkForce).distance($.get(config).linkDistance);
	});

	$.user_effect(() => {
		reheatSimulation();
		chargeForce.distanceMin($.get(config).chargeDistanceMin).distanceMax($.get(config).chargeDistanceMax).strength($.get(config).chargeStrength);
	});

	$.user_effect(() => {
		reheatSimulation();
		collideForce.radius($.get(config).collideRadius).strength($.get(config).collideStrength);
	});

	$.user_effect(() => {
		reheatSimulation();
		centerForce.strength($.get(config).centerStrength);
	});

	function handleStart() {
		$.get(config).running = true;
	}

	function handleTick(e) {
		// If we weren't already using `bind:alpha`, then this is
		// where we would get access to the current values of
		// `alpha` and `alphaTarget` and could make adjustments accordingly.
	}

	function handleEnd() {
		$.get(config).running = false;
	}

	function reheatSimulation(args = {}) {
		const _ = args;

		$.set(alpha, 1.0);
		$.get(config).alpha = 1.0;
	}

	var $$exports = { data };
	var fragment = root();
	var node_1 = $.first_child(fragment);

	ForceGraphControls(node_1, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node_3 = $.first_child(fragment_1);

			Layer(node_3, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							let linkPositions = () => ($$arg0?.()).linkPositions;
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, () => links, $.index, ($$anchor, link, i) => {
								Link($$anchor, $.spread_props(
									{
										get data() {
											return $.get(link);
										}
									},
									() => linkPositions()[i],
									{
										class: 'stroke-surface-content',
										get curve() {
											return curveLinear;
										},

										get 'stroke-width'() {
											return $.get(config).linkWidth;
										},

										get opacity() {
											return $.get(config).linkOpacity;
										}
									}
								));
							});

							var node_5 = $.sibling(node_4, 2);

							$.each(node_5, 17, nodes, $.index, ($$anchor, node) => {
								{
									let $0 = $.derived(() => colorScale($.get(node).group.toString()));

									Circle($$anchor, {
										get cx() {
											return $.get(node).x;
										},

										get cy() {
											return $.get(node).y;
										},

										get r() {
											return $.get(config).nodeRadius;
										},

										get fill() {
											return $.get($0);
										},

										get 'stroke-width'() {
											return $.get(config).nodeStrokeWidth;
										},
										class: 'stroke-surface-content',
										onpointermove: (e) => context().tooltip.show(e, $.get(node)),
										get onpointerleave() {
											return context().tooltip.hide;
										}
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						let $0 = $.derived(() => ({
							...$.get(config).hasLinkForce && { link: $.get(linkForce) },
							...$.get(config).hasChargeForce && { charge: chargeForce },
							...$.get(config).hasCollideForce && { collide: collideForce },
							...$.get(config).hasCenterForce && {
								center: centerForce.x(context().width / 2).y(context().height / 2)
							}
						}));

						let $1 = $.derived(() => ({ nodes, links }));

						ForceSimulation($$anchor, {
							get forces() {
								return $.get($0);
							},

							get alphaTarget() {
								return $.get(config).alphaTarget;
							},

							get stopped() {
								return $.get(config).isStopped;
							},

							get static() {
								return $.get(config).isStatic;
							},
							onStart: handleStart,
							onTick: handleTick,
							onEnd: handleEnd,
							get data() {
								return $.get($1);
							},

							get alpha() {
								return $.get(alpha);
							},

							set alpha($$value) {
								$.set(alpha, $$value, true);
							},
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_3, 2);

			$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
				Tooltip_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, context().tooltip.data?.id));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		Chart(node_2, { height: 600, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}