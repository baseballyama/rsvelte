import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';

export default function ComponentNodeLifecycleChild($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getChartContext();

		ctx.registerComponent({
			name: 'ComponentNodeLifecycleChild',
			kind: 'mark',
			markInfo: () => ({ y: 'other' })
		});

		$$renderer.push(`<div data-testid="component-node-lifecycle-child"></div>`);
	});
}