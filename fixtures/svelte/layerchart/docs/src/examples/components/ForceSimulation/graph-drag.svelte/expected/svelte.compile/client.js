import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { forceManyBody, forceLink, forceCenter } from 'd3-force';
import { curveLinear } from 'd3-shape';
import StickyControl from '$lib/components/controls/ForceSimluationControls2.svelte';
import { Chart, Link, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { cls } from '@layerstack/tailwind';
import { clamp } from '@layerstack/utils';
import { movable } from '$lib/actions/movable.js';

var root = $.from_svg(`<circle></circle>`);
var root_1 = $.from_svg(`<!><!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Graph_drag($$anchor, $$props) {
	$.push($$props, true);

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
	let sticky = $.state(true);
	let dragging = $.state(false);
	var $$exports = { data };
	var fragment = root_2();
	var node_1 = $.first_child(fragment);

	StickyControl(node_1, {
		get sticky() {
			return $.get(sticky);
		},

		set sticky($$value) {
			$.set(sticky, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_2();
			var node_3 = $.first_child(fragment_1);

			Layer(node_3, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							let simulation = () => ($$arg0?.()).simulation;
							let linkPositions = () => ($$arg0?.()).linkPositions;
							var fragment_3 = root_1();
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
										get curve() {
											return curveLinear;
										},
										class: 'stroke-surface-content/20'
									}
								));
							});

							var node_5 = $.sibling(node_4);

							$.each(node_5, 17, nodes, $.index, ($$anchor, node, i) => {
								const thisNode = $.derived(() => simulation().nodes()[i]);
								var circle = root();

								$.set_attribute(circle, 'r', 12);

								$.action(circle, ($$node, $$action_arg) => movable?.($$node, $$action_arg), () => ({
									onMoveStart: () => {
										context().tooltip.hide();
										$.set(dragging, true);
									},

									onMove: (e) => {
										$.get(thisNode).fx = clamp(($.get(thisNode).fx ?? $.get(thisNode).x ?? 0) + e.detail.dx, 0, context().width);
										$.get(thisNode).fy = clamp(($.get(thisNode).fy ?? $.get(thisNode).y ?? 0) + e.detail.dy, 0, context().height);
										simulation().alpha(1).restart();
									},

									onMoveEnd: (e) => {
										$.set(dragging, false);

										if (!$.get(sticky)) {
											const thisNode = simulation().nodes()[i];

											delete thisNode.fx;
											delete thisNode.fy;
											simulation().alpha(1).restart();
										}
									}
								}));

								$.template_effect(
									($0) => {
										$.set_attribute(circle, 'cx', $.get(node).x);
										$.set_attribute(circle, 'cy', $.get(node).y);
										$.set_class(circle, 0, $0);
									},
									[
										() => $.clsx(cls('cursor-all-scroll', $.get(node).fx ? 'fill-primary' : 'fill-surface-content'))
									]
								);

								$.delegated('click', circle, () => {
									if ($.get(thisNode).fx) {
										delete $.get(thisNode).fx;
										delete $.get(thisNode).fy;
										simulation().alpha(1).restart();
									}
								});

								$.delegated('pointermove', circle, (e) => !$.get(dragging) && context().tooltip.show(e, $.get(node)));

								$.event('pointerleave', circle, function (...$$args) {
									context().tooltip.hide?.apply(this, $$args);
								});

								$.append($$anchor, circle);
							});

							$.append($$anchor, fragment_3);
						};

						let $0 = $.derived(() => ({
							link: linkForce,
							charge: chargeForce,
							center: centerForce.x(context().width / 2).y(context().height / 2)
						}));

						let $1 = $.derived(() => ({ nodes, links }));

						ForceSimulation($$anchor, {
							get forces() {
								return $.get($0);
							},

							get data() {
								return $.get($1);
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

$.delegate(['click', 'pointermove']);