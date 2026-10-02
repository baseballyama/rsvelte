import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
import { addSource, removeSource } from './source.js';
import { flush } from '$lib/flush.js';

export default function GeoJSON($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Generate a unique id for each feature. This will overwrite existing IDs. */
		/** Use this property on the feature as the ID. This will overwrite existing IDs. */
		/** True to calculate line lengths. Required to use a line layer that
		 * uses the "line-gradient" paint property. */
		let {
			id = getId('geojson'),
			data,
			generateId = false,
			promoteId = undefined,
			filter = undefined,
			lineMetrics = undefined,
			cluster = undefined,
			maxzoom = undefined,
			attribution = undefined,
			buffer = undefined,
			tolerance = undefined,
			children
		} = $$props;

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		const { source } = updatedSourceContext();
		let sourceObj = void 0;
		let first = true;

		// Don't set the data again after we've just created it.
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