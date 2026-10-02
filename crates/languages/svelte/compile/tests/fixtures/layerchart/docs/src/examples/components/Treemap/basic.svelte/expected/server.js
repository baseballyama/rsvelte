import * as $ from 'svelte/internal/server';
import { Chart, Group, Layer, Rect, Text } from 'layerchart';
import { Treemap } from 'layerchart/hierarchy';
import { scaleOrdinal } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import { hierarchy } from 'd3-hierarchy';

export default function Basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = hierarchy({
			name: 'root',
			children: [
				{ name: 'A', value: 1000 },
				{ name: 'B', value: 900 },
				{ name: 'C', value: 800 },
				{ name: 'D', value: 700 },
				{ name: 'E', value: 600 },
				{ name: 'F', value: 500 },
				{ name: 'G', value: 400 },
				{ name: 'H', value: 300 },
				{ name: 'I', value: 200 },
				{ name: 'J', value: 100 },
				{ name: 'K', value: 100 }
			]
		}).sum((d) => {
			// @ts-expect-error
			return d.value;
		});

		const simpleOrdinalColor = scaleOrdinal(schemeSpectral[11].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
		);

		Chart($$renderer, {
			height: 400,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						{
							function children($$renderer, { nodes }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(nodes.filter((n) => n.depth > 0));

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let node = each_array[$$index];

									Group($$renderer, {
										x: node.x0,
										y: node.y0,
										children: ($$renderer) => {
											const nodeWidth = node.x1 - node.x0;
											const nodeHeight = node.y1 - node.y0;

											Rect($$renderer, {
												width: nodeWidth,
												height: nodeHeight,
												stroke: 'rgb(0, 0, 0, 0.2)',
												fill: simpleOrdinalColor(node.data.name)
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												x: nodeWidth / 2,
												y: nodeHeight / 2,
												value: node.data.name,
												fill: 'rgb(0, 0, 0, 0.8)',
												textAnchor: 'middle',
												verticalAnchor: 'middle'
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							Treemap($$renderer, { hierarchy: data, children, $$slots: { default: true } });
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