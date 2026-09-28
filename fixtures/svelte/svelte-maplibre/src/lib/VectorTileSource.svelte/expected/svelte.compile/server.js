import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
import { addSource, removeSource } from './source.js';
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import { flush } from '$lib/flush.js';

export default function VectorTileSource($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = getId('vector'),
			url = undefined,
			tiles = undefined,
			promoteId = undefined,
			bounds = undefined,
			scheme = undefined,
			attribution = undefined,
			minzoom = undefined,
			maxzoom = undefined,
			volatile = undefined,
			children
		} = $$props;

		if (url && url.includes('pmtiles://')) {
			if (!Object.hasOwn(maplibregl.config.REGISTERED_PROTOCOLS, 'pmtiles')) {
				let protocol = new pmtiles.Protocol();

				maplibregl.addProtocol('pmtiles', protocol.tile);
			}
		}

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		const { source } = updatedSourceContext();
		let sourceObj = void 0;

		function handleStyleLoad() {
			if (!map()) return;

			// When the style changes the current sources are nuked and recreated. Because of this the
			// source object no longer references the current source on the map so we update it here.
			sourceObj = map().getSource(id);
		}

		onDestroy(() => {
			map()?.off('style.load', handleStyleLoad);

			if (source.value && map()) {
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