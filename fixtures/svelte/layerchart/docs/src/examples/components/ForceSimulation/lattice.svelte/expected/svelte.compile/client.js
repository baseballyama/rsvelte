import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { forceManyBody, forceLink } from 'd3-force';
import { curveLinear } from 'd3-shape';
import { Chart, Circle, Link, Layer } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

var root = $.from_html(`<!> <!>`, 1);

export default function Lattice($$anchor, $$props) {
	$.push($$props, true);

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
	var $$exports = { data };

	Chart($$anchor, {
		height: 800,
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let nodes = () => ($$arg0?.()).nodes;
					let linkPositions = () => ($$arg0?.()).linkPositions;

					Layer($$anchor, {
						center: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, () => links, $.index, ($$anchor, link, i) => {
								Link($$anchor, $.spread_props(() => linkPositions()[i], {
									get data() {
										return $.get(link);
									},
									class: 'stroke-surface-content/20',
									get curve() {
										return curveLinear;
									}
								}));
							});

							var node_2 = $.sibling(node_1, 2);

							$.each(node_2, 17, nodes, $.index, ($$anchor, node) => {
								Circle($$anchor, {
									get cx() {
										return $.get(node).x;
									},

									get cy() {
										return $.get(node).y;
									},
									r: 3,
									class: 'fill-surface-content'
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				let $0 = $.derived(() => ({ nodes, links }));
				let $1 = $.derived(() => ({ charge: chargeForce, link: linkForce }));

				ForceSimulation($$anchor, {
					get data() {
						return $.get($0);
					},

					get forces() {
						return $.get($1);
					},
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}