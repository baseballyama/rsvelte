import 'svelte/internal/disclose-version';
import { getSimpleGraph } from '$lib/graph.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Group, Link, Rect, Layer, Text } from 'layerchart';
import { Sankey } from 'layerchart/graph';

const data = await getSimpleGraph();
var root = $.from_html(`<!> <!>`, 1);

export default function Simple($$anchor, $$props) {
	$.push($$props, true);

	Chart($$anchor, {
		get data() {
			return data;
		},
		flatData: [],
		height: 400,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let links = () => ($$arg0?.()).links;
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, links, (link) => [link.value, link.source.id, link.target.id].join('-'), ($$anchor, link) => {
								Link($$anchor, {
									sankey: true,
									get data() {
										return $.get(link);
									},

									get strokeWidth() {
										return $.get(link).width;
									},
									class: 'stroke-surface-content/10'
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
										var fragment_6 = root();
										var node_3 = $.first_child(fragment_6);

										Rect(node_3, {
											get width() {
												return $.get(nodeWidth);
											},

											get height() {
												return $.get(nodeHeight);
											},
											class: 'fill-primary'
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
												verticalAnchor: 'middle'
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						Sankey($$anchor, { nodeId: (d) => d.id, children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}