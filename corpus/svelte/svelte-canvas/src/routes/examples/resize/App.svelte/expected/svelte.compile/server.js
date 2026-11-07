import * as $ from 'svelte/internal/server';
import { Canvas, Layer } from '$lib';
import ResizableLayer from './ResizableLayer.svelte';

export default function App($$renderer) {
	let colors = ['tomato', 'goldenrod', 'mediumturquoise'];
	const sort = (color) => colors = colors.sort((a, b) => a === color ? 1 : b === color ? -1 : 0);

	Canvas($$renderer, {
		style: 'touch-action: none',
		layerEvents: true,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let color = each_array[i];
				const c = (i + 1) * 85;

				{
					function content($$renderer, bounds) {
						Layer($$renderer, {
							render: ({ context }) => {
								const { x0, y0, x1, y1 } = bounds;

								context.globalAlpha = 0.9;
								context.fillStyle = color;
								context.fillRect(x0, y0, x1 - x0, y1 - y0);
								context.globalAlpha = 1;
							}
						});
					}

					ResizableLayer($$renderer, {
						initialBounds: { x0: c, y0: c, x1: c + 338, y1: c + 338 },
						onmousedown: () => sort(color),
						ontouchstart: () => sort(color),
						content,
						$$slots: { content: true }
					});
				}
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}