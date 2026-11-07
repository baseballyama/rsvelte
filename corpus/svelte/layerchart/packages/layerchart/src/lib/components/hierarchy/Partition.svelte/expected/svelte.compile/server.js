import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { partition as d3Partition } from 'd3-hierarchy';

export default function Partition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			size,
			padding,
			round,
			orientation = 'horizontal',
			hierarchy,
			children,
			nodes = void 0
		} = $$props;

		const ctx = getChartContext();

		const partitionData = $.derived(() => {
			const h = hierarchy.copy();
			const _partition = d3Partition().size(size ?? (orientation === 'horizontal' ? [ctx.height, ctx.width] : [ctx.width, ctx.height]));

			if (padding) {
				_partition.padding(padding);
			}

			if (round) {
				_partition.round(round);
			}

			return _partition(h).descendants();
		});

		children?.($$renderer, { nodes: partitionData() });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { nodes });
	});
}