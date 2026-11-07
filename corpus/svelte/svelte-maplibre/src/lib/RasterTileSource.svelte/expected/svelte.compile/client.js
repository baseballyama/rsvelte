import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
import { addSource, removeSource } from './source.js';
import { flush } from '$lib/flush.js';
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';

export default function RasterTileSource($$anchor, $$props) {
	$.push($$props, true);

	/** An array one or more tile source URLs pointing to the tiles.
	 * Either `tiles` or `url` must be provided. */
	/** A single URL pointing to a PMTiles archive. Either `tiles` or `url` must be provided. */
	let id = $.prop($$props, 'id', 19, () => getId('raster-source')),
		tiles = $.prop($$props, 'tiles', 3, undefined),
		tileSize = $.prop($$props, 'tileSize', 3, undefined),
		url = $.prop($$props, 'url', 3, undefined),
		bounds = $.prop($$props, 'bounds', 3, undefined),
		scheme = $.prop($$props, 'scheme', 3, undefined),
		attribution = $.prop($$props, 'attribution', 3, undefined),
		minzoom = $.prop($$props, 'minzoom', 3, undefined),
		maxzoom = $.prop($$props, 'maxzoom', 3, undefined),
		volatile = $.prop($$props, 'volatile', 3, undefined);

	if (url() && url().includes('pmtiles://')) {
		if (!Object.hasOwn(maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty, 'pmtiles')) {
			let protocol = new pmtiles.Protocol();

			maplibregl.addProtocol('pmtiles', protocol.tile);
		}
	}

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	const { source } = updatedSourceContext();
	let sourceObj = $.state(void 0);
	let first = $.state(true);

	$.user_effect(() => {
		if ($.get(map) && $.get(loaded) && source.value !== id()) {
			source.value = id();

			addSource(
				$.get(map),
				source.value,
				flush({
					type: 'raster',
					tiles: tiles(),
					tileSize: tileSize(),
					url: url(),
					bounds: bounds(),
					scheme: scheme(),
					attribution: attribution(),
					minzoom: minzoom(),
					maxzoom: maxzoom(),
					volatile: volatile()
				}),
				(sourceId) => $.get(map) && sourceId === source.value,
				() => {
					if (!source.value) {
						return;
					}

					$.set(sourceObj, $.get(map).getSource(source.value), true);
					$.set(first, true);
				}
			);
		}
	});

	// Don't set tiles/url again after we've just created it.
	$.user_effect(() => {
		if ($.get(sourceObj)) {
			if ($.get(first)) {
				$.set(first, false);
			} else if (tiles()) {
				$.get(sourceObj).setTiles(tiles());
			} else {
				// @ts-expect-error This doesn't seem to actually exist. Leaving it for now until I'm sure I'm not missing something.
				$.get(sourceObj).setUrl(url());
			}
		}
	});

	function handleStyleLoad() {
		if (!$.get(map)) return;

		// When the style changes the current sources are nuked and recreated. Because of this the
		// source object no longer references the current source on the map so we update it here.
		$.set(sourceObj, $.get(map).getSource(id()), true);
	}

	$.user_effect(() => {
		$.get(map)?.on('style.load', handleStyleLoad);
	});

	onDestroy(() => {
		if (source.value && $.get(sourceObj) && $.get(map)) {
			removeSource($.get(map), source.value, $.get(sourceObj));
			source.value = undefined;
			$.set(sourceObj, undefined);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => source.value, ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (source.value) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}