import * as $ from 'svelte/internal/server';
import { Chart, Group, Layer, Link, Rect, Text } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';
import { hierarchy } from 'd3-hierarchy';

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Chart($$renderer, {
			padding: { top: 16, left: nodeWidth / 2, right: nodeWidth / 2 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						{
							function children($$renderer, { nodes, links }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(links);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let link = each_array[$$index];

									Link($$renderer, {
										data: link,
										orientation: 'horizontal',
										class: 'stroke-surface-content opacity-20'
									});
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_1 = $.ensure_array_like(nodes);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let node = each_array_1[$$index_1];

									Group($$renderer, {
										x: node.y - nodeWidth / 2,
										y: node.x - nodeHeight / 2,
										children: ($$renderer) => {
											Rect($$renderer, {
												width: nodeWidth,
												height: nodeHeight,
												class: node.data.children
													? 'fill-surface-100 stroke-primary'
													: 'fill-surface-100 stroke-secondary [stroke-dasharray:1]',
												rx: 10
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												value: node.data.name,
												x: nodeWidth / 2,
												y: nodeHeight / 2,
												dy: -2,
												textAnchor: 'middle',
												verticalAnchor: 'middle',
												class: `text-xs pointer-events-none ${node.data.children ? 'fill-primary' : 'fill-secondary'}`
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Tree($$renderer, {
								hierarchy: data,
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

		$.bind_props($$props, { data });
	});
}