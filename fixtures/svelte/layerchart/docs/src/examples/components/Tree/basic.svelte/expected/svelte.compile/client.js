import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Group, Layer, Link, Rect, Text } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';
import { hierarchy } from 'd3-hierarchy';

var root = $.from_html(`<!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	const data = hierarchy({
		name: 'Root',
		children: [
			{
				name: 'A',
				children: [{ name: 'A1' }, { name: 'A2' }, { name: 'A3' }]
			},
			{ name: 'B', children: [{ name: 'B1' }, { name: 'B2' }] },
			{ name: 'C' }
		]
	});

	const nodeWidth = 60;
	const nodeHeight = 20;
	var $$exports = { data };

	Chart($$anchor, {
		padding: { top: 16, left: nodeWidth / 2, right: nodeWidth / 2 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							let links = () => ($$arg0?.()).links;
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, links, $.index, ($$anchor, link) => {
								Link($$anchor, {
									get data() {
										return $.get(link);
									},
									orientation: 'horizontal',
									class: 'stroke-surface-content opacity-20'
								});
							});

							var node_2 = $.sibling(node_1, 2);

							$.each(node_2, 17, nodes, $.index, ($$anchor, node) => {
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
											var fragment_6 = root();
											var node_3 = $.first_child(fragment_6);

											{
												let $0 = $.derived(() => $.get(node).data.children
													? 'fill-surface-100 stroke-primary'
													: 'fill-surface-100 stroke-secondary [stroke-dasharray:1]');

												Rect(node_3, {
													width: nodeWidth,
													height: nodeHeight,
													get class() {
														return $.get($0);
													},
													rx: 10
												});
											}

											var node_4 = $.sibling(node_3, 2);

											{
												let $0 = $.derived(() => $.get(node).data.children ? 'fill-primary' : 'fill-secondary');

												Text(node_4, {
													get value() {
														return $.get(node).data.name;
													},
													x: nodeWidth / 2,
													y: nodeHeight / 2,
													dy: -2,
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													get class() {
														return `text-xs pointer-events-none ${$.get($0) ?? ''}`;
													}
												});
											}

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						Tree($$anchor, {
							get hierarchy() {
								return data;
							},
							orientation: 'horizontal',
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

	return $.pop($$exports);
}