import * as $ from 'svelte/internal/server';
import { asAny } from '$lib/utils/types.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { createPattern } from '$lib/utils/canvas.js';
import { createId } from '$lib/utils/createId.js';
import { buildPatternShapes } from './Pattern.shared.svelte.js';

export default function Pattern_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		const chartCtx = getChartContext();

		let {
			id = createId('pattern-', uid),
			size = 4,
			width = size,
			height = size,
			lines: linesProp,
			circles: circlesProp,
			rects: rectsProp,
			background,
			children
		} = $$props;

		const shapes = $.derived(() => buildPatternShapes(linesProp, circlesProp, size, width, height, rectsProp));
		let canvasPattern = null;

		function render(_ctx) {
			const pattern = createPattern(_ctx, width, height, shapes(), background);

			canvasPattern = pattern;
		}

		chartCtx.registerComponent({
			name: 'Pattern',
			kind: 'group',
			canvasRender: { render, deps: () => [width, height, shapes(), background] }
		});

		children?.($$renderer, { id, pattern: asAny(canvasPattern) });
		$$renderer.push(`<!---->`);
	});
}