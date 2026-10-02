import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	sankey as d3Sankey,
	sankeyLeft,
	sankeyCenter,
	sankeyRight,
	sankeyJustify
} from 'd3-sankey';

import { getChartContext } from '$lib/contexts/chart.js';

export default function Sankey($$anchor, $$props) {
	$.push($$props, true);

	// https://github.com/d3/d3-sankey
	let nodesProp = $.prop($$props, 'nodes', 3, (d) => d.nodes),
		nodeId = $.prop($$props, 'nodeId', 3, (d) => d.index),
		nodeAlign = $.prop($$props, 'nodeAlign', 3, sankeyJustify),
		nodeWidth = $.prop($$props, 'nodeWidth', 3, 4),
		nodePadding = $.prop($$props, 'nodePadding', 3, 10),
		linksProp = $.prop($$props, 'links', 3, (d) => d.links);

	const ctx = getChartContext();

	const sankeyData = $.derived(() => {
		return d3Sankey().size([ctx.width, ctx.height]).nodes(nodesProp()).nodeId(nodeId()).nodeAlign(nodeAlign() === 'left'
			? sankeyLeft
			: nodeAlign() === 'center'
				? sankeyCenter
				: nodeAlign() === 'right'
					? sankeyRight
					: nodeAlign() === 'justify' ? sankeyJustify : nodeAlign()).nodeWidth(nodeWidth()).nodePadding(nodePadding()).// @ts-expect-error
		nodeSort($$props.nodeSort).links(linksProp()).// @ts-expect-error
		linkSort($$props.linkSort)(structuredClone(ctx.data));
	});

	$.user_effect(() => {
		$$props.onUpdate?.($.get(sankeyData));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({
		nodes: $.get(sankeyData).nodes,
		links: $.get(sankeyData).links
	}));

	$.append($$anchor, fragment);
	$.pop();
}