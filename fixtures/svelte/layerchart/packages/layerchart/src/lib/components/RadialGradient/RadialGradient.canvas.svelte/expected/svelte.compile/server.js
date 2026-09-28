import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { getComputedStyles } from '$lib/utils/canvas.js';
import { parsePercent } from '$lib/utils/math.js';
import { createId } from '$lib/utils/createId.js';

export default function RadialGradient_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId('radialGradient-', uid),
			stops = ['var(--tw-gradient-from)', 'var(--tw-gradient-to)'],
			cx = '50%',
			cy = '50%',
			fx = cx,
			fy = cy,
			children,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const ctx = getChartContext();
		let canvasGradient = void 0;

		function render(_ctx) {
			// TODO: Set correct values: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient.
			// TODO: Memoize `createRadialGradient()` (see LinearGradient)
			const gradient = _ctx.createRadialGradient(0, 0, 0, 0, 0, 0);

			// Use `getComputedStyles()` to convert each stop (if using CSS variables and/or classes) to color values
			for (let i = 0; i < stops.length; i++) {
				const stop = stops[i];

				if (Array.isArray(stop)) {
					const { fill } = getComputedStyles(_ctx.canvas, { styles: { fill: stop[1] }, classes: className });

					gradient.addColorStop(parsePercent(stop[0]), fill);
				} else {
					const { fill } = getComputedStyles(_ctx.canvas, { styles: { fill: stop }, classes: className });

					gradient.addColorStop(i / (stops.length - 1), fill);
				}
			}

			canvasGradient = gradient;
		}

		ctx.registerComponent({
			name: 'Gradient',
			kind: 'group',
			canvasRender: {
				render,
				deps: () => [stops, cx, cy, fx, fy, ctx.width, ctx.height]
			}
		});

		children?.($$renderer, { id, gradient: canvasGradient });
		$$renderer.push(`<!---->`);
	});
}