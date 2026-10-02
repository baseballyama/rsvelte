import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { getCanvasContext } from '$lib/contexts/canvas.js';
import { setSSRCapture } from './captureStore.js';

export default function ContextCapture($$anchor, $$props) {
	$.push($$props, true);

	const chartState = getChartContext();
	const canvasCtx = getCanvasContext();
	const captured = { chartState, rootNode: canvasCtx.getRootNode?.() };

	if (typeof window === 'undefined') {
		if ($$props.capture) {
			Object.assign($$props.capture, captured);
		}

		setSSRCapture(captured);
		$$props.onCapture?.(captured);
	}

	$.pop();
}