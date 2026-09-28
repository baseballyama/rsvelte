import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';

export default function ComponentNodeLifecycleParent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onparentnode, children } = $$props;
		const ctx = getChartContext();
		const node = ctx.registerComponent({ name: 'ComponentNodeLifecycleParent', kind: 'group' });

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}