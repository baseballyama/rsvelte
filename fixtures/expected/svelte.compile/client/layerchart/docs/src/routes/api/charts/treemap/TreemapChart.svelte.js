import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { hierarchy } from 'd3-hierarchy';
import { scaleSequential } from 'd3-scale';
import { interpolateGnBu } from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import { sortFunc } from '@layerstack/utils';
import { ServerChart } from 'layerchart/server';
import { Group, Rect, RectClipPath, Text } from 'layerchart';
import { Treemap } from 'layerchart/hierarchy';

var root_1 = $.from_html(`<!> <!>`, 1);

export default function TreemapChart($$anchor, $$props) {
	$.push($$props, true);

	const root = $.derived(() => hierarchy($$props.data).// @ts-expect-error
	sum((d) => d.value).sort(sortFunc('value', 'desc')));

	const sequentialColor = scaleSequential([4, -1], interpolateGnBu);

	function getNodeColor(node) {
		return sequentialColor(node.depth).toString();
	}

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
		padding: { top: 4, right: 4, bottom: 4, left: 4 },
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let nodes = () => ($$arg0?.()).nodes;
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, nodes, $.index, ($$anchor, node) => {
						const nodeWidth = $.derived(() => $.get(node).x1 - $.get(node).x0);
						const nodeHeight = $.derived(() => $.get(node).y1 - $.get(node).y0);
						const nodeColor = $.derived(() => getNodeColor($.get(node)));

						Group($$anchor, {
							get x() {
								return $.get(node).x0;
							},

							get y() {
								return $.get(node).y0;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var node_2 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => hsl($.get(nodeColor)).darker(1).toString());
									let $1 = $.derived(() => $.get(node).children ? 0.5 : 1);

									Rect(node_2, {
										get width() {
											return $.get(nodeWidth);
										},

										get height() {
											return $.get(nodeHeight);
										},

										get stroke() {
											return $.get($0);
										},

										get fill() {
											return $.get(nodeColor);
										},

										get fillOpacity() {
											return $.get($1);
										},
										rx: 5
									});
								}

								var node_3 = $.sibling(node_2, 2);

								RectClipPath(node_3, {
									get width() {
										return $.get(nodeWidth);
									},

									get height() {
										return $.get(nodeHeight);
									},

									children: ($$anchor, $$slotProps) => {
										Text($$anchor, {
											get value() {
												return $.get(node).data.name;
											},
											x: 6,
											y: 20,
											fill: 'rgba(0,0,0,0.7)'
										});
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				Treemap($$anchor, {
					get hierarchy() {
						return $.get(root);
					},
					paddingOuter: 4,
					paddingInner: 4,
					paddingTop: 20,
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}