import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Point($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { d, children } = $$props;
		const ctx = getChartContext();

		children?.($$renderer, { x: ctx.xGet(d), y: ctx.yGet(d) });
		$$renderer.push(`<!---->`);
	});
}