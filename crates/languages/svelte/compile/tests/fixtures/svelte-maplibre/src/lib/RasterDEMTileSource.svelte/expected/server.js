import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
import { addSource, removeSource } from './source.js';
import { flush } from '$lib/flush.js';

export default function RasterDEMTileSource($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = getId('raster-source'),
			tiles,
			tileSize = undefined,
			bounds = undefined,
			attribution = undefined,
			minzoom = undefined,
			maxzoom = undefined,
			volatile = undefined,
			encoding = undefined,
			redFactor = undefined,
			greenFactor = undefined,
			blueFactor = undefined,
			baseShift = undefined,
			children
		} = $$props;

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		const { source } = updatedSourceContext();
		let sourceObj = void 0;
		let first = true;

		// Don't set tiles again after we've just created it.
		function handleStyleLoad() {
			if (!map()) return;

			// When the style changes the current sources are nuked and recreated. Because of this the
			// source object no longer references the current source on the map so we update it here.
			sourceObj = map().getSource(id);
		}

		onDestroy(() => {
			if (source.value && sourceObj && map()) {
				removeSource(map(), source.value, sourceObj);
				source.value = undefined;
				sourceObj = undefined;
			}
		});

		if (source.value) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}