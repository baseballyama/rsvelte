import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderPathData } from '$lib/utils/canvas.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { PathState } from './Path.shared.svelte.js';

export default function Path_canvas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { pathData, $$slots, $$events, ...rest } = $$props;
		const c = new PathState(() => pathData, () => rest);

		function render(ctx, styleOverrides) {
			renderPathData(ctx, c.tweenedPathData ?? '', styleOverrides
				? merge({ styles: { strokeWidth: rest.strokeWidth } }, styleOverrides)
				: {
					styles: {
						fill: rest.fill,
						fillOpacity: rest.fillOpacity,
						stroke: rest.stroke,
						strokeOpacity: rest.strokeOpacity,
						strokeWidth: rest.strokeWidth,
						opacity: rest.opacity
					},
					classes: cls('lc-path', rest.class),
					style: rest.style
				});
		}

		// TODO: Use objectId to work around Svelte 4 reactivity issue
		const fillKey = createKey(() => rest.fill);

		const strokeKey = createKey(() => rest.stroke);

		c.chartCtx.registerComponent({
			name: 'Path',
			kind: 'mark',
			canvasRender: {
				render,
				events: {
					get click() {
						return rest.onclick;
					},

					get pointerenter() {
						return rest.onpointerenter;
					},

					get pointermove() {
						return rest.onpointermove;
					},

					get pointerleave() {
						return rest.onpointerleave;
					},

					get pointerdown() {
						return rest.onpointerdown;
					},

					get pointerover() {
						return rest.onpointerover;
					},

					get pointerout() {
						return rest.onpointerout;
					},

					get touchmove() {
						return rest.ontouchmove;
					}
				},

				deps: () => [
					fillKey.current,
					rest.fillOpacity,
					strokeKey.current,
					rest.strokeOpacity,
					rest.strokeWidth,
					rest.opacity,
					rest.class,
					c.tweenedPathData,
					rest.style
				]
			}
		});
	});
}