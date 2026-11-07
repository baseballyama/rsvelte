import 'svelte/internal/disclose-version';
import { getDisjointGraph } from '$lib/graph.remote.js';
import * as $ from 'svelte/internal/client';
import { forceManyBody, forceLink, forceX, forceY } from 'd3-force';
import { curveLinear } from 'd3-shape';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Chart, Circle, Link, Layer } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

const data = await getDisjointGraph();
var root = $.from_html(`<!> <!>`, 1);

export default function Disjoint_graph($$anchor, $$props) {
	$.push($$props, true);

	const nodes = $.derived(() => data.nodes);
	const links = $.derived(() => data.links);
	const colorScale = scaleOrdinal(schemeCategory10);
	const linkForce = $.derived(() => forceLink($.get(links)).id((d) => d.id));
	const chargeForce = forceManyBody().strength(-30).theta(0.9);
	const xForce = forceX();
	const yForce = forceY();

	function keyForLink(link) {
		return link.value + link.index;
	}

	Chart($$anchor, {
		height: 680,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							let links = () => ($$arg0?.()).links;
							let linkPositions = () => ($$arg0?.()).linkPositions;
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 19, links, (link) => keyForLink(link), ($$anchor, link, i) => {
								Link($$anchor, $.spread_props(
									{
										get data() {
											return $.get(link);
										}
									},
									() => linkPositions()[$.get(i)],
									{
										class: 'stroke-surface-content/50',
										get curve() {
											return curveLinear;
										}
									}
								));
							});

							var node_2 = $.sibling(node_1, 2);

							$.each(node_2, 17, nodes, $.index, ($$anchor, node) => {
								{
									let $0 = $.derived(() => colorScale($.get(node).group.toString()));

									Circle($$anchor, {
										get cx() {
											return $.get(node).x;
										},

										get cy() {
											return $.get(node).y;
										},
										r: 3,
										get fill() {
											return $.get($0);
										}
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						let $0 = $.derived(() => ({
							link: $.get(linkForce),
							charge: chargeForce,
							x: xForce,
							y: yForce
						}));

						let $1 = $.derived(() => ({ nodes: $.get(nodes), links: $.get(links) }));

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
		},
		$$slots: { default: true }
	});

	$.pop();
}