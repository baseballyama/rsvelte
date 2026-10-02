import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getMapContext, setZoomLimits } from './context.svelte.js';

export default function ZoomRange($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** If true, only instantiate the slot contents when the map zoom is in range. If false,
		 * the layers themselves will handle it. Usually you will want this to be false. */
		let {
			minzoom = undefined,
			maxzoom = undefined,
			enforce = false,
			children
		} = $$props;

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		let zoomLimits = setZoomLimits(minzoom, maxzoom);

		// svelte-ignore state_referenced_locally
		let zoom = map()?.getZoom() ?? 1;

		function handleZoom() {
			const currentZoom = map()?.getZoom();

			if (currentZoom) {
				zoom = currentZoom;
			}
		}

		onDestroy(() => {
			if (loaded()) {
				map()?.off('zoom', handleZoom);
			}
		});

		if (!enforce || zoomLimits.minzoom <= zoom && zoom <= zoomLimits.maxzoom) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}