import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tree as d3Tree } from 'd3-hierarchy';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Tree($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, 'horizontal');
	const ctx = getChartContext();

	const treeData = $.derived(() => {
		const _tree = ctx.radial
			? d3Tree().size([2 * Math.PI, Math.min(ctx.width, ctx.height) / 2]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
			: d3Tree().size(orientation() === 'horizontal' ? [ctx.height, ctx.width] : [ctx.width, ctx.height]);

		if ($$props.nodeSize) {
			_tree.nodeSize($$props.nodeSize);
		}

		if ($$props.separation) {
			_tree.separation($$props.separation);
		}

		if ($$props.hierarchy) {
			const h = $$props.hierarchy.copy();
			const treeData = _tree(h);

			return { links: treeData.links(), nodes: treeData.descendants() };
		}

		return { links: [], nodes: [] };
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ nodes: $.get(treeData).nodes, links: $.get(treeData).links }));
	$.append($$anchor, fragment);
	$.pop();
}