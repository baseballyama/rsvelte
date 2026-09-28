import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ServerChart } from 'layerchart/server';
import { Group, Link, Rect, Text } from 'layerchart';
import { Sankey } from 'layerchart/graph';

var root = $.from_html(`<!> <!>`, 1);

export default function SankeyChart($$anchor, $$props) {
	$.push($$props, true);

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

		get data() {
			return $$props.data;
		},
		flatData: [],
		padding: 10,
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let links = () => ($$arg0?.()).links;
					let nodes = () => ($$arg0?.()).nodes;
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, links, (link) => [link.value, link.source.id, link.target.id].join('-'), ($$anchor, link) => {
						Link($$anchor, {
							sankey: true,
							get data() {
								return $.get(link);
							},

							get strokeWidth() {
								return $.get(link).width;
							},
							stroke: 'rgba(59, 130, 246, 0.2)',
							fill: 'none'
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.each(node_2, 17, nodes, (node) => node.id, ($$anchor, node) => {
						const nodeWidth = $.derived(() => ($.get(node).x1 ?? 0) - ($.get(node).x0 ?? 0));
						const nodeHeight = $.derived(() => ($.get(node).y1 ?? 0) - ($.get(node).y0 ?? 0));

						Group($$anchor, {
							get x() {
								return $.get(node).x0;
							},

							get y() {
								return $.get(node).y0;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_3 = $.first_child(fragment_5);

								Rect(node_3, {
									get width() {
										return $.get(nodeWidth);
									},

									get height() {
										return $.get(nodeHeight);
									},
									fill: 'rgb(59, 130, 246)'
								});

								var node_4 = $.sibling(node_3, 2);

								{
									let $0 = $.derived(() => $.get(node).height === 0 ? -4 : $.get(nodeWidth) + 4);
									let $1 = $.derived(() => $.get(nodeHeight) / 2);
									let $2 = $.derived(() => $.get(node).height === 0 ? 'end' : 'start');

									Text(node_4, {
										get value() {
											return $.get(node).id;
										},

										get x() {
											return $.get($0);
										},

										get y() {
											return $.get($1);
										},

										get textAnchor() {
											return $.get($2);
										},
										verticalAnchor: 'middle',
										fill: 'rgba(0,0,0,0.7)'
									});
								}

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				Sankey($$anchor, { nodeId: (d) => d.id, children, $$slots: { default: true } });
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}