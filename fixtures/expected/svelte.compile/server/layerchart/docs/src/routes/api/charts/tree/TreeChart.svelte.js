import * as $ from 'svelte/internal/server';
import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
import { ServerChart } from 'layerchart/server';
import { Group, Link, Rect, Text } from 'layerchart';
import { Tree } from 'layerchart/hierarchy';

export default function TreeChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, width, height, capture, onCapture } = $$props;
		const nodeWidth = 100;
		const nodeHeight = 20;
		const hierarchy = $.derived(() => d3Hierarchy(data, (d) => d.children));

		ServerChart($$renderer, {
			capture,
			onCapture,
			width,
			height,
			padding: {
				top: 20,
				bottom: 20,
				left: nodeWidth / 2 + 10,
				right: nodeWidth / 2 + 10
			},

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
								stroke: 'rgba(0,0,0,0.2)',
								fill: 'none'
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
										fill: 'white',
										stroke: node.children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.3)',
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
										fill: node.children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.5)'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Tree($$renderer, {
						hierarchy: hierarchy(),
						orientation: 'horizontal',
						children,
						$$slots: { default: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});
}