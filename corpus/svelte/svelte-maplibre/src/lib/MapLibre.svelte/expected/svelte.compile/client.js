import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flush } from '$lib/flush.js';
import { Box, createMapContext, setLayerEvent } from './context.svelte.js';
import { getViewportHash, parseViewportHash } from './hash.js';
import * as maplibregl from 'maplibre-gl';
import compare from 'just-compare';
import 'maplibre-gl/dist/maplibre-gl.css';
import { boundsEqual, convertBoundsToUserFormat } from './types.js';
import NavigationControl from './NavigationControl.svelte';
import GeolocateControl from './GeolocateControl.svelte';
import FullscreenControl from './FullscreenControl.svelte';
import ScaleControl from './ScaleControl.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div data-testid="map-container"><!></div>`);

export default function MapLibre($$anchor, $$props) {
	$.push($$props, true);

	/** The `div` element that the Map is placed into. You can bind to this prop to access the element for yourself.
	 * Setting it externally will have no effect. */
	/** The style to use for the map. */
	/** Tell MapLibre to update the map in place when changing the style, diffing the old style against the new one to
	 * make minimal changes. If you enable this, be aware of https://github.com/maplibre/maplibre-gl-js/issues/2651,
	 * which may prevent some style changes from becoming visible when diffing is enabled. */
	/** How many zoom levels past a source's `maxzoom` to overscale its tiles. Below that, tiles are
	 * split instead, which improves labeling at high zoom. Pass `null` to overscale at every zoom
	 * level, restoring the behavior from before MapLibre 6. Only applied when the map is created.
	 * @default 4 */
	/** Set to true to track the map viewport in the URL hash. If the URL hash is set, that overrides initial viewport settings. */
	/** Update the URL when the hash changes, if `hash` is true.
	 * The default behavior uses `window.history.replaceState`. For SvelteKit, you should
	 *  `import { replaceState } from '$app/navigation';` and pass something like
	 *  `updateHash={(u) => replaceState(u, $page.state)}` when instantiating the map.
	 */
	/** Override MapLibre's default locale table */
	/** Set false to hide the default attribution control, so you can add your own. */
	/** Set true to require hitting ⌘/Ctrl while scrolling to zoom. Or use two fingers on phones. */
	/** Set to true if you want to export the map as an image */
	/** Custom images to load into the map. */
	/** Set to true or a position to add all the standard controls. */
	/** Filter the map's builtin layers, hiding any for which this function returns false. */
	/** Function that modifies requests, such as by adding an API key. **/
	let map = $.prop($$props, 'map', 15, undefined),
		mapContainer = $.prop($$props, 'mapContainer', 15, undefined),
		classNames = $.prop($$props, 'class', 3, undefined),
		diffStyleUpdates = $.prop($$props, 'diffStyleUpdates', 3, false),
		center = $.prop($$props, 'center', 15, undefined),
		zoom = $.prop($$props, 'zoom', 15, undefined),
		pitch = $.prop($$props, 'pitch', 15, 0),
		bearing = $.prop($$props, 'bearing', 15, 0),
		bearingSnap = $.prop($$props, 'bearingSnap', 3, 7),
		bounds = $.prop($$props, 'bounds', 15, undefined),
		fitBoundsOptions = $.prop($$props, 'fitBoundsOptions', 19, () => ({})),
		hash = $.prop($$props, 'hash', 3, false),
		projection = $.prop($$props, 'projection', 3, undefined),
		updateHash = $.prop($$props, 'updateHash', 3, (url) => {
			window.history.replaceState(window.history.state, '', url);
		}),
		loaded = $.prop($$props, 'loaded', 15, false),
		minZoom = $.prop($$props, 'minZoom', 3, 0),
		maxZoom = $.prop($$props, 'maxZoom', 3, 22),
		minPitch = $.prop($$props, 'minPitch', 3, 0),
		maxPitch = $.prop($$props, 'maxPitch', 3, 60),
		renderWorldCopies = $.prop($$props, 'renderWorldCopies', 3, undefined),
		dragPan = $.prop($$props, 'dragPan', 3, undefined),
		dragRotate = $.prop($$props, 'dragRotate', 3, undefined),
		pitchWithRotate = $.prop($$props, 'pitchWithRotate', 3, undefined),
		antialias = $.prop($$props, 'antialias', 3, undefined),
		zoomOnDoubleClick = $.prop($$props, 'zoomOnDoubleClick', 3, true),
		locale = $.prop($$props, 'locale', 3, undefined),
		interactive = $.prop($$props, 'interactive', 3, true),
		attributionControl = $.prop($$props, 'attributionControl', 3, undefined),
		cooperativeGestures = $.prop($$props, 'cooperativeGestures', 3, false),
		preserveDrawingBuffer = $.prop($$props, 'preserveDrawingBuffer', 3, false),
		maxBounds = $.prop($$props, 'maxBounds', 3, undefined),
		images = $.prop($$props, 'images', 19, () => []),
		standardControls = $.prop($$props, 'standardControls', 3, false),
		filterLayers = $.prop($$props, 'filterLayers', 3, undefined),
		transformRequest = $.prop($$props, 'transformRequest', 3, undefined);

	let standardControlsPosition = $.derived(() => typeof standardControls() === 'boolean' ? undefined : standardControls());
	const mapContext = createMapContext();

	setLayerEvent(new Box(undefined));

	let loadingImages = $.state($.proxy(new Set()));

	async function loadImage(image, force = false) {
		if (!map()) {
			return;
		}

		if (!map()?.loaded() && !force) {
			return;
		}

		if ('url' in image) {
			$.get(loadingImages).add(image.id);

			try {
				let imageData = await map().loadImage(image.url);

				map().addImage(image.id, imageData.data, image.options);
				mapContext.loadedImages.add(image.id);
			} catch(e) {
				if ($$props.onerror) {
					$$props.onerror({ error: e });
				} else {
					console.error(e);
				}
			} finally {
				$.get(loadingImages).delete(image.id);
			}
		} else {
			map().addImage(image.id, image.data, image.options);
			mapContext.loadedImages.add(image.id);
		}
	}

	$.user_effect(() => {
		if (loaded() && map()?.loaded()) {
			for (let image of images()) {
				if (!mapContext.loadedImages.has(image.id) && !$.get(loadingImages).has(image.id) && !map().hasImage(image.id)) {
					loadImage(image);
				}
			}
		}
	});

	let allImagesLoaded = $.derived(() => images().every((image) => mapContext.loadedImages.has(image.id)));

	// These variables are used to keep track of what sources / layers
	// are part of the basemap style vs those that are part of the
	// user defined sources and layers. This is so we can reconstruct the
	// user defined sources and layers after a basemap style change which
	// overwrites all previous sources and layers
	let lastStyleLayerIds = $.state(undefined);

	let lastStyleSourceIds = $.state(undefined);
	let layersToReAddAfterStyleChange = $.state(undefined);
	let sourcesToReAddAfterStyleChange = $.state(undefined);

	function handleError(event) {
		if ($$props.onerror) {
			$$props.onerror(event);
		} else if (event.error.name !== 'AbortError') {
			// If there's no error handler, just log it to match the default behavior from MapLibre.
			// But skip AbortError since that's a normal thing that happens inside certain sources,
			// and not useful to log.
			console.error(event.error);
		}
	}

	function createMap(element) {
		onHashChange();

		map(mapContext.map = new maplibregl.Map({
			...flush({
				container: element,
				style: $$props.style,
				locale: locale(),
				center: center(),
				zoom: zoom(),
				pitch: pitch(),
				bearing: bearing(),
				bearingSnap: bearingSnap(),
				minZoom: minZoom(),
				maxZoom: maxZoom(),
				minPitch: minPitch(),
				maxPitch: maxPitch(),
				renderWorldCopies: renderWorldCopies(),
				dragPan: dragPan(),
				dragRotate: dragRotate(),
				pitchWithRotate: pitchWithRotate(),
				antialias: antialias(),
				interactive: interactive(),
				preserveDrawingBuffer: preserveDrawingBuffer(),
				maxBounds: maxBounds(),
				bounds: bounds(),
				attributionControl: attributionControl(),
				transformRequest: transformRequest(),
				cooperativeGestures: cooperativeGestures(),
				aroundCenter: $$props.aroundCenter
			}),

			// MapLibre tells "absent" (overscale 4 levels) apart from an explicit `undefined`
			// (overscale everything), and `flush` drops both, so this is applied outside it.
			...$$props.zoomLevelsToOverscale === undefined
				? {}
				: {
					zoomLevelsToOverscale: $$props.zoomLevelsToOverscale ?? undefined
				}
		}));

		map().on('load', (e) => {
			e.target.getContainer().setAttribute('data-testid', 'map');
			e.target.getCanvas().setAttribute('data-testid', 'map-canvas');

			if ($$props.onload) {
				$$props.onload(map());
			}

			mapContext.loaded = true;
			loaded(true);
		});

		map().on('error', handleError);

		if ($$props.onmovestart) {
			map().on('movestart', $$props.onmovestart);
		}

		map().on('moveend', (ev) => {
			center(ev.target.getCenter());
			zoom(ev.target.getZoom());
			pitch(ev.target.getPitch());
			bearing(ev.target.getBearing());
			bounds(convertBoundsToUserFormat(ev.target.getBounds(), bounds()));
			$$props.onmoveend?.(ev);

			if (hash()) {
				let location = new URL(window.location.href.replace(/(#.+)?$/, getViewportHash(ev.target)));

				updateHash()(location);
			}
		});

		if ($$props.onclick) {
			map().on('click', $$props.onclick);
		}

		if ($$props.ondblclick) {
			map().on('dblclick', $$props.ondblclick);
		}

		if ($$props.oncontextmenu) {
			map().on('contextmenu', $$props.oncontextmenu);
		}

		if ($$props.onmousemove) {
			map().on('mousemove', $$props.onmousemove);
		}

		if ($$props.onzoomstart) {
			map().on('zoomstart', $$props.onzoomstart);
		}

		if ($$props.onzoom) {
			map().on('zoom', $$props.onzoom);
		}

		if ($$props.onzoomend) {
			map().on('zoomend', $$props.onzoomend);
		}

		if ($$props.onpitch) {
			map().on('pitch', $$props.onpitch);
		}

		if ($$props.onrotate) {
			map().on('rotate', $$props.onrotate);
		}

		if ($$props.onwheel) {
			map().on('wheel', $$props.onwheel);
		}

		if ($$props.ondata) {
			map().on('data', $$props.ondata);
		}

		if ($$props.onidle) {
			map().on('idle', $$props.onidle);
		}

		// When the basemap style is changed, it nukes all existing layers and sources
		// Here we listen for style.load events, store the layers and sources that
		// have come from the new basemap style and then add back in any layers and
		// styles that where added by the user as sub elements
		map().on('style.load', (ev) => {
			if (map()) {
				if (projection()) {
					map().setProjection(projection());
				}

				mapContext.loaded = true;
				loaded(true);

				const mapStyle = map().getStyle();

				$.set(lastStyleLayerIds, mapStyle.layers.map((l) => l.id), true);
				$.set(lastStyleSourceIds, Object.keys(mapStyle.sources), true);

				if ($.get(sourcesToReAddAfterStyleChange)) {
					for (const [id, source] of Object.entries($.get(sourcesToReAddAfterStyleChange))) {
						map().addSource(id, source);
					}
				}

				if ($.get(layersToReAddAfterStyleChange)) {
					for (const layer of $.get(layersToReAddAfterStyleChange)) {
						map().addLayer(layer);
					}
				}

				// Need to reload images as well when the style is changed.
				for (const image of images()) {
					// Force the image to reload, since when this runs map.loaded() == false
					// but it's actually safe to do so.
					loadImage(image, true);
				}

				$$props.onstyleload?.(ev);
			}
		});

		map().on('styledata', (ev) => {
			if (map() && filterLayers()) {
				const layers = map().getStyle().layers;

				if (layers) {
					for (let layer of layers) {
						if (!filterLayers()(layer)) {
							map().setLayoutProperty(layer.id, 'visibility', 'none');
						}
					}
				}
			}

			$$props.onstyledata?.(ev);
		});

		return {
			destroy() {
				loaded(false);
				mapContext.loaded = false;
				map()?.remove();
			}
		};
	}

	let lastStyle = $.state($.proxy($$props.style));

	// If the last style is different from the current one
	// we grab a list of the currrent layers and sources
	// compare this with the stored list of layer and source ids
	// to pick out the layers / sources which are not part of the current
	// basemaps.
	// We then update the style which will trigger the style.load event on
	// map which will in turn add the user defined sources and layers back
	// on to the map
	$.user_effect(() => {
		if (map() && !compare($$props.style, $.get(lastStyle))) {
			const oldMapStyle = map().getStyle();

			if ($.get(lastStyleLayerIds)) {
				$.set(layersToReAddAfterStyleChange, oldMapStyle.layers.filter((l) => !$.get(lastStyleLayerIds).includes(l.id)), true);
			}

			if ($.get(lastStyleSourceIds)) {
				const nonStyleSourceIds = Object.keys(oldMapStyle.sources).filter((sourceId) => !$.get(lastStyleSourceIds).includes(sourceId));

				$.set(sourcesToReAddAfterStyleChange, {}, true);

				for (const id of nonStyleSourceIds) {
					$.get(sourcesToReAddAfterStyleChange)[id] = oldMapStyle.sources[id];
				}
			}

			$.set(lastStyle, $$props.style, true);
			map().setStyle($$props.style, { diff: diffStyleUpdates() });

			// Changing the style unloads the images. We'll reload them after the map finishes loading the new style.
			mapContext.loadedImages.clear();

			$.set(loadingImages, new Set(), true);
		}
	});

	$.user_effect(() => {
		if (map()) {
			let options = {};

			if (center() != null && !compare(center(), map().getCenter())) {
				options.center = center();
			}

			if (zoom() != null && !compare(zoom(), map().getZoom())) {
				options.zoom = zoom();
			}

			if (bearing() != null && !compare(bearing(), map().getBearing())) {
				options.bearing = bearing();
			}

			if (pitch() != null && !compare(pitch(), map().getPitch())) {
				options.pitch = pitch();
			}

			if (Object.keys(options).length) {
				map().easeTo(options);
			}
		}
	});

	$.user_effect(() => {
		if (projection() && loaded()) {
			map()?.setProjection(projection());
		}
	});

	$.user_effect(() => {
		if (bounds()) {
			const { equal, bounds: newBounds } = boundsEqual(bounds(), map()?.getBounds());

			if (!equal) {
				map()?.fitBounds(newBounds, fitBoundsOptions());
			}
		}
	});

	$.user_effect(() => {
		zoomOnDoubleClick()
			? map()?.doubleClickZoom.enable()
			: map()?.doubleClickZoom.disable();
	});

	function onHashChange() {
		if (hash()) {
			let parts = parseViewportHash(window.location.hash);

			if (parts.length >= 3) {
				zoom(parts[0]);
				center([parts[2], parts[1]]);
			}

			if (parts.length == 5) {
				bearing(parts[3]);
				pitch(parts[4]);
			}
		}
	}

	var div = root_2();

	$.event('hashchange', $.window, onHashChange);

	let classes;
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					NavigationControl(node_2, {
						get position() {
							return $.get(standardControlsPosition);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => ({ ...fitBoundsOptions(), maxZoom: 12 }));

						GeolocateControl(node_3, {
							get position() {
								return $.get(standardControlsPosition);
							},

							get fitBoundsOptions() {
								return $.get($0);
							}
						});
					}

					var node_4 = $.sibling(node_3, 2);

					FullscreenControl(node_4, {
						get position() {
							return $.get(standardControlsPosition);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					ScaleControl(node_5, {
						get position() {
							return $.get(standardControlsPosition);
						}
					});

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if (standardControls()) $$render(consequent);
				});
			}

			var node_6 = $.sibling(node_1, 2);

			$.snippet(node_6, () => $$props.children ?? $.noop, () => ({
				map: map(),
				loaded: loaded(),
				loadedImages: mapContext.loadedImages,
				allImagesLoaded: $.get(allImagesLoaded)
			}));

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (map()) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => mapContainer($$value), () => mapContainer());
	$.action(div, ($$node) => createMap?.($$node));
	$.template_effect(() => classes = $.set_class(div, 1, $.clsx(classNames()), 'svelte-1w7ilhr', classes, { 'expand-map': !classNames() }));
	$.append($$anchor, div);
	$.pop();
}