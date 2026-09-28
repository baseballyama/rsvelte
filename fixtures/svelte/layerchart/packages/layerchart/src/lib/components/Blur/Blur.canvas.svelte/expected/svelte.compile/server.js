import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';

export default function Blur_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { stdDeviation = 5, children } = $$props;
		const chartCtx = getChartContext();

		chartCtx.registerComponent({
			name: 'Blur',
			kind: 'group',
			canvasRender: {
				render: (ctx) => {
					ctx.filter = `blur(${stdDeviation}px)`;
				},
				deps: () => [stdDeviation]
			}
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}