import * as $ from 'svelte/internal/server';
import { hierarchy } from 'd3-hierarchy';
import { scaleSequential } from 'd3-scale';
import { interpolateGnBu } from 'd3-scale-chromatic';
import { hsl } from 'd3-color';
import { sortFunc } from '@layerstack/utils';
import { ServerChart } from 'layerchart/server';
import { Group, Rect, RectClipPath, Text } from 'layerchart';
import { Treemap } from 'layerchart/hierarchy';

export default function TreemapChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, width, height, capture, onCapture } = $$props;

		const root = $.derived(() => hierarchy(data).// @ts-expect-error
		sum((d) => d.value).sort(sortFunc('value', 'desc')));

		const sequentialColor = scaleSequential([4, -1], interpolateGnBu);

		function getNodeColor(node) {
			return sequentialColor(node.depth).toString();
		}

		ServerChart($$renderer, {
			capture,
			onCapture,
			width,
			height,
			padding: { top: 4, right: 4, bottom: 4, left: 4 },
			children: ($$renderer) => {
				{
					function children($$renderer, { nodes }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(nodes);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let node = each_array[$$index];
							const nodeWidth = node.x1 - node.x0;
							const nodeHeight = node.y1 - node.y0;
							const nodeColor = getNodeColor(node);

							Group($$renderer, {
								x: node.x0,
								y: node.y0,
								children: ($$renderer) => {
									Rect($$renderer, {
										width: nodeWidth,
										height: nodeHeight,
										stroke: hsl(nodeColor).darker(1).toString(),
										fill: nodeColor,
										fillOpacity: node.children ? 0.5 : 1,
										rx: 5
									});

									$$renderer.push(`<!----> `);

									RectClipPath($$renderer, {
										width: nodeWidth,
										height: nodeHeight,
										children: ($$renderer) => {
											Text($$renderer, { value: node.data.name, x: 6, y: 20, fill: 'rgba(0,0,0,0.7)' });
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Treemap($$renderer, {
						hierarchy: root(),
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
	});
}