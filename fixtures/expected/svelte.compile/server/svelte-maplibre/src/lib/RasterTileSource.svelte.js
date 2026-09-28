import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
import { addSource, removeSource } from './source.js';
import { flush } from '$lib/flush.js';
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';

export default function RasterTileSource($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** An array one or more tile source URLs pointing to the tiles.
		 * Either `tiles` or `url` must be provided. */
		/** A single URL pointing to a PMTiles archive. Either `tiles` or `url` must be provided. */
		let {
			id = getId('raster-source'),
			tiles = undefined,
			tileSize = undefined,
			url = undefined,
			bounds = undefined,
			scheme = undefined,
			attribution = undefined,
			minzoom = undefined,
			maxzoom = undefined,
			volatile = undefined,
			children
		} = $$props;

		if (url && url.includes('pmtiles://')) {
			if (!Object.hasOwn(maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty, 'pmtiles')) {
				let protocol = new pmtiles.Protocol();

				maplibregl.addProtocol('pmtiles', protocol.tile);
			}
		}

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		const { source } = updatedSourceContext();
		let sourceObj = void 0;
		let first = true;

		// Don't set tiles/url again after we've just created it.
		// @ts-expect-error This doesn't seem to actually exist. Leaving it for now until I'm sure I'm not missing something.
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