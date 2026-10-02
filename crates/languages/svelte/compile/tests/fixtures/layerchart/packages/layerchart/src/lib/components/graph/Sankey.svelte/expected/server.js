import * as $ from 'svelte/internal/server';

import {
	sankey as d3Sankey,
	sankeyLeft,
	sankeyCenter,
	sankeyRight,
	sankeyJustify
} from 'd3-sankey';

import { getChartContext } from '$lib/contexts/chart.js';

export default function Sankey($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// https://github.com/d3/d3-sankey
		let {
			nodes: nodesProp = (d) => d.nodes,
			nodeId = (d) => d.index,
			nodeAlign = sankeyJustify,
			nodeWidth = 4,
			nodePadding = 10,
			nodeSort,
			links: linksProp = (d) => d.links,
			linkSort,
			onUpdate,
			children
		} = $$props;

		const ctx = getChartContext();

		const sankeyData = $.derived(() => {
			return d3Sankey().size([ctx.width, ctx.height]).nodes(nodesProp).nodeId(nodeId).nodeAlign(nodeAlign === 'left'
				? sankeyLeft
				: nodeAlign === 'center'
					? sankeyCenter
					: nodeAlign === 'right'
						? sankeyRight
						: nodeAlign === 'justify' ? sankeyJustify : nodeAlign).nodeWidth(nodeWidth).nodePadding(nodePadding).// @ts-expect-error
			nodeSort(nodeSort).links(linksProp).// @ts-expect-error
			linkSort(linkSort)(structuredClone(ctx.data));
		});

		children?.($$renderer, { nodes: sankeyData().nodes, links: sankeyData().links });
		$$renderer.push(`<!---->`);
	});
}