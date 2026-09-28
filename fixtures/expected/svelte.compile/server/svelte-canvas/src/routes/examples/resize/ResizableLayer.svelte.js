import * as $ from 'svelte/internal/server';
import Handle from './ResizableLayerHandle.svelte';
import Surface from './ResizableLayerSurface.svelte';

export default function ResizableLayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const [N, S, E, W] = [1, 2, 4, 8];
		const HANDLES = [N, S, E, W, N | E, N | W, S | E, S | W];
		const SURFACE = N | S | E | W;

		let {
			initialBounds = { x0: 160, y0: 160, x1: 480, y1: 480 },
			onmousedown,
			ontouchstart,
			content
		} = $$props;

		let x0 = initialBounds.x0;
		let y0 = initialBounds.y0;
		let x1 = initialBounds.x1;
		let y1 = initialBounds.y1;
		const bounds = $.derived(() => ({ x0, y0, x1, y1 }));
		let hoveredHandle = null;
		let draggedHandle = null;
		let previousTouch = void 0;
		const active = $.derived(() => Boolean(hoveredHandle || draggedHandle));
		const sortedHandles = $.derived(() => HANDLES.sort((a, b) => a === hoveredHandle ? 1 : b === hoveredHandle ? -1 : 0));
		const setCursor = ({ style }) => ({ update: (cursor) => style.cursor = cursor });

		content($$renderer, bounds());
		$$renderer.push(`<!----> `);

		Surface($$renderer, {
			bounds: bounds(),
			show: active(),
			onmouseenter: () => {
				hoveredHandle = SURFACE;
			},

			ontouchstart: () => {
				draggedHandle = SURFACE;
				ontouchstart?.();
			},

			onmouseleave: () => {
				hoveredHandle = null;
			},

			onmousedown: () => {
				draggedHandle = SURFACE;
				onmousedown?.();
			}
		});

		$$renderer.push(`<!----> `);

		if (active()) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(sortedHandles());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let handle = each_array[$$index];

				Handle($$renderer, {
					active: handle === hoveredHandle || handle === draggedHandle,
					x: handle & W ? x0 : handle & E ? x1 : (x0 + x1) / 2,
					y: handle & N ? y0 : handle & S ? y1 : (y0 + y1) / 2,
					onmouseenter: () => {
						hoveredHandle = handle;
					},

					ontouchstart: () => {
						draggedHandle = handle;
						ontouchstart?.();
					},
					onmouseleave: () => hoveredHandle = null,
					onmousedown: () => {
						draggedHandle = handle;
						onmousedown?.();
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}