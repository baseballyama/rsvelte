import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { pack as d3Pack } from 'd3-hierarchy';

export default function Pack($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();

		let {
			size,
			padding,
			children,
			hierarchy: hierarchyProp,
			nodes = void 0
		} = $$props;

		const packedData = $.derived(() => {
			const h = hierarchyProp.copy();
			const _pack = d3Pack().size(size ?? [ctx.width, ctx.height]);

			if (padding) {
				_pack.padding(padding);
			}

			return _pack(h).descendants();
		});

		children?.($$renderer, { nodes: packedData() });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { nodes });
	});
}