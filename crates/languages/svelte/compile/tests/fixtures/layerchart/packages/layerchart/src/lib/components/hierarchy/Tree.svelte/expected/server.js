import * as $ from 'svelte/internal/server';
import { tree as d3Tree } from 'd3-hierarchy';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Tree($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			nodeSize,
			separation,
			orientation = 'horizontal',
			children,
			hierarchy
		} = $$props;

		const ctx = getChartContext();

		const treeData = $.derived(() => {
			const _tree = ctx.radial
				? d3Tree().size([2 * Math.PI, Math.min(ctx.width, ctx.height) / 2]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
				: d3Tree().size(orientation === 'horizontal' ? [ctx.height, ctx.width] : [ctx.width, ctx.height]);

			if (nodeSize) {
				_tree.nodeSize(nodeSize);
			}

			if (separation) {
				_tree.separation(separation);
			}

			if (hierarchy) {
				const h = hierarchy.copy();
				const treeData = _tree(h);

				return { links: treeData.links(), nodes: treeData.descendants() };
			}

			return { links: [], nodes: [] };
		});

		children?.($$renderer, { nodes: treeData().nodes, links: treeData().links });
		$$renderer.push(`<!---->`);
	});
}