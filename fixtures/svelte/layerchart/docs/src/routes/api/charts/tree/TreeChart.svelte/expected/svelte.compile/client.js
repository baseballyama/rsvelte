import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { ServerChart } from 'layerchart/server';
import { Group, Link, Rect, Text } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';

var root = $.from_html(`<!> <!>`, 1);

export default function TreeChart($$anchor, $$props) {
	$.push($$props, true);

	const nodeWidth = 100;
	const nodeHeight = 20;
	const hierarchy = $.derived(() => d3Hierarchy($$props.data, (d) => d.children));

	ServerChart($$anchor, {
		get capture() {
			return $$props.capture;
		},

		get onCapture() {
			return $$props.onCapture;
		},

		get width() {
			return $$props.width;
		},

		get height() {
			return $$props.height;
		},

		padding: {
			top: 20,
			bottom: 20,
			left: nodeWidth / 2 + 10,
			right: nodeWidth / 2 + 10
		},

		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let nodes = () => ($$arg0?.()).nodes;
					let links = () => ($$arg0?.()).links;
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, links, (link) => link.source.data.name + '_' + link.target.data.name, ($$anchor, link) => {
						Link($$anchor, {
							get data() {
								return $.get(link);
							},
							orientation: 'horizontal',
							stroke: 'rgba(0,0,0,0.2)',
							fill: 'none'
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.each(node_2, 17, nodes, (node) => node.data.name + node.depth, ($$anchor, node) => {
						{
							let $0 = $.derived(() => $.get(node).y - nodeWidth / 2);
							let $1 = $.derived(() => $.get(node).x - nodeHeight / 2);

							Group($$anchor, {
								get x() {
									return $.get($0);
								},

								get y() {
									return $.get($1);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_3 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => $.get(node).children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.3)');

										Rect(node_3, {
											width: nodeWidth,
											height: nodeHeight,
											fill: 'white',
											get stroke() {
												return $.get($0);
											},
											rx: 10
										});
									}

									var node_4 = $.sibling(node_3, 2);

									{
										let $0 = $.derived(() => $.get(node).children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.5)');

										Text(node_4, {
											get value() {
												return $.get(node).data.name;
											},
											x: nodeWidth / 2,
											y: nodeHeight / 2,
											dy: -2,
											textAnchor: 'middle',
											verticalAnchor: 'middle',
											get fill() {
												return $.get($0);
											}
										});
									}

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_2);
				};

				Tree($$anchor, {
					get hierarchy() {
						return $.get(hierarchy);
					},
					orientation: 'horizontal',
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}