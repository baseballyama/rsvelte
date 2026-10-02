import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '$lib/draw-plugin.css';
import MapLibre from '$lib/MapLibre.svelte';
import CodeSample from '$site/CodeSample.svelte';
import code from './+page.svelte?raw';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Import MapboxDraw and its CSS
	// Also need this CSS which lets the mouse pointers work correctly with Maplibre
	// when switching modes in the draw plugin.
	// import 'svelte-maplibre/draw-plugin.css';
	maplibregl.setWorkerUrl(maplibreWorkerUrl);

	let map = $.state(void 0);

	function createMapboxDraw() {
		let draw = new MapboxDraw();
		const origOnAdd = draw.onAdd.bind(draw);

		// MapboxDraw assumes that the `mapboxgl-ctrl-group` and `mapboxgl-ctrl` CSS classes exist,
		// but Maplibre uses different names, so add them to the control element here.
		//
		// @ts-expect-error draw's onadd expects a mapboxgl.Map but we have a maplibregl.Map, which has close enough to the
		// same API.
		draw.onAdd = (map) => {
			// @ts-expect-error Same as above
			let el = origOnAdd(map);

			el.classList.add('maplibregl-ctrl-group');
			el.classList.add('maplibregl-ctrl');

			return el;
		};

		return draw;
	}

	let draw = createMapboxDraw();

	$.user_effect(() => {
		// @ts-expect-error
		$.get(map).addControl(draw);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	MapLibre(node, {
		style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
		class: 'relative aspect-[9/16] max-h-[70vh] w-full sm:aspect-video sm:max-h-full',
		standardControls: true,
		get map() {
			return $.get(map);
		},

		set map($$value) {
			$.set(map, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	CodeSample(node_1, {
		get code() {
			return code;
		},
		startBoundary: '<scrip',
		endBoundary: '<CodeSample',
		omitEndBoundary: true
	});

	$.append($$anchor, fragment);
	$.pop();
}