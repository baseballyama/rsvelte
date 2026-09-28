import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, Layer } from '$lib';
import ResizableLayer from './ResizableLayer.svelte';

export default function App($$anchor) {
	let colors = $.state($.proxy(['tomato', 'goldenrod', 'mediumturquoise']));
	const sort = (color) => $.set(colors, $.get(colors).sort((a, b) => a === color ? 1 : b === color ? -1 : 0), true);

	Canvas($$anchor, {
		style: 'touch-action: none',
		layerEvents: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 18, () => $.get(colors), (color) => color, ($$anchor, color, i) => {
				const c = $.derived(() => ($.get(i) + 1) * 85);

				{
					const content = ($$anchor, bounds = $.noop) => {
						Layer($$anchor, {
							render: ({ context }) => {
								const { x0, y0, x1, y1 } = bounds();

								context.globalAlpha = 0.9;
								context.fillStyle = color;
								context.fillRect(x0, y0, x1 - x0, y1 - y0);
								context.globalAlpha = 1;
							}
						});
					};

					let $0 = $.derived(() => ({
						x0: $.get(c),
						y0: $.get(c),
						x1: $.get(c) + 338,
						y1: $.get(c) + 338
					}));

					ResizableLayer($$anchor, {
						get initialBounds() {
							return $.get($0);
						},
						onmousedown: () => sort(color),
						ontouchstart: () => sort(color),
						content,
						$$slots: { content: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}