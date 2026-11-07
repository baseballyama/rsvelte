import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { merge } from '@layerstack/utils';
import { renderPathData } from '$lib/utils/canvas.js';
import { createKey } from '$lib/utils/key.svelte.js';
import { PathState } from './Path.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'pathData']);

export default function Path_canvas($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const c = new PathState(() => $$props.pathData, () => rest);

	function render(ctx, styleOverrides) {
		renderPathData(ctx, c.tweenedPathData ?? '', styleOverrides
			? merge({ styles: { strokeWidth: $$props.strokeWidth } }, styleOverrides)
			: {
				styles: {
					fill: $$props.fill,
					fillOpacity: $$props.fillOpacity,
					stroke: $$props.stroke,
					strokeOpacity: $$props.strokeOpacity,
					strokeWidth: $$props.strokeWidth,
					opacity: $$props.opacity
				},
				classes: cls('lc-path', $$props.class),
				style: $$props.style
			});
	}

	// TODO: Use objectId to work around Svelte 4 reactivity issue
	const fillKey = createKey(() => $$props.fill);

	const strokeKey = createKey(() => $$props.stroke);

	c.chartCtx.registerComponent({
		name: 'Path',
		kind: 'mark',
		canvasRender: {
			render,
			events: {
				get click() {
					return $$props.onclick;
				},

				get pointerenter() {
					return $$props.onpointerenter;
				},

				get pointermove() {
					return $$props.onpointermove;
				},

				get pointerleave() {
					return $$props.onpointerleave;
				},

				get pointerdown() {
					return $$props.onpointerdown;
				},

				get pointerover() {
					return $$props.onpointerover;
				},

				get pointerout() {
					return $$props.onpointerout;
				},

				get touchmove() {
					return $$props.ontouchmove;
				}
			},

			deps: () => [
				fillKey.current,
				$$props.fillOpacity,
				strokeKey.current,
				$$props.strokeOpacity,
				$$props.strokeWidth,
				$$props.opacity,
				$$props.class,
				c.tweenedPathData,
				$$props.style
			]
		}
	});

	$.pop();
}