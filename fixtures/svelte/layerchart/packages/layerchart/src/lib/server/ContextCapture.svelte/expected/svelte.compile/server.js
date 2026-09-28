import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { getCanvasContext } from '$lib/contexts/canvas.js';
import { setSSRCapture } from './captureStore.js';

export default function ContextCapture($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { capture, onCapture } = $$props;
		const chartState = getChartContext();
		const canvasCtx = getCanvasContext();
		const captured = { chartState, rootNode: canvasCtx.getRootNode?.() };

		if (typeof window === 'undefined') {
			if (capture) {
				Object.assign(capture, captured);
			}

			setSSRCapture(captured);
			onCapture?.(captured);
		}
	});
}