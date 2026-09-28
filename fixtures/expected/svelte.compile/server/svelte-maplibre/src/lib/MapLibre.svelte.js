import * as $ from 'svelte/internal/server';
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

export default function MapLibre($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			map = undefined,
			mapContainer = undefined,
			class: classNames = undefined,
			style,
			diffStyleUpdates = false,
			center = undefined,
			zoom = undefined,
			pitch = 0,
			bearing = 0,
			bearingSnap = 7,
			bounds = undefined,
			fitBoundsOptions = {},
			hash = false,
			projection = undefined,
			zoomLevelsToOverscale,
			updateHash = (url) => {
				window.history.replaceState(window.history.state, '', url);
			},
			loaded = false,
			minZoom = 0,
			maxZoom = 22,
			minPitch = 0,
			maxPitch = 60,
			renderWorldCopies = undefined,
			dragPan = undefined,
			dragRotate = undefined,
			pitchWithRotate = undefined,
			antialias = undefined,
			zoomOnDoubleClick = true,
			locale = undefined,
			interactive = true,
			attributionControl = undefined,
			cooperativeGestures = false,
			preserveDrawingBuffer = false,
			maxBounds = undefined,
			images = [],
			aroundCenter,
			standardControls = false,
			filterLayers = undefined,
			transformRequest = undefined,
			children,
			onload,
			onerror,
			onclick,
			ondblclick,
			onmousemove,
			oncontextmenu,
			onmovestart,
			onmoveend,
			onzoomstart,
			onzoom,
			onzoomend,
			onpitch,
			onrotate,
			onwheel,
			ondata,
			onstyleload,
			onstyledata,
			onidle
		} = $$props;

		let standardControlsPosition = $.derived(() => typeof standardControls === 'boolean' ? undefined : standardControls);
		const mapContext = createMapContext();

		setLayerEvent(new Box(undefined));

		let loadingImages = new Set();

		async function loadImage(image, force = false) {
			if (!map) {
				return;
			}

			if (!map?.loaded() && !force) {
				return;
			}

			if ('url' in image) {
				loadingImages.add(image.id);

				try {
					let imageData = await map.loadImage(image.url);

					map.addImage(image.id, imageData.data, image.options);
					mapContext.loadedImages.add(image.id);
				} catch(e) {
					if (onerror) {
						onerror({ error: e });
					} else {
						console.error(e);
					}
				} finally {
					loadingImages.delete(image.id);
				}
			} else {
				map.addImage(image.id, image.data, image.options);
				mapContext.loadedImages.add(image.id);
			}
		}

		let allImagesLoaded = $.derived(() => images.every((image) => mapContext.loadedImages.has(image.id)));

		// These variables are used to keep track of what sources / layers
		// are part of the basemap style vs those that are part of the
		// user defined sources and layers. This is so we can reconstruct the
		// user defined sources and layers after a basemap style change which
		// overwrites all previous sources and layers
		let lastStyleLayerIds = undefined;

		let lastStyleSourceIds = undefined;
		let layersToReAddAfterStyleChange = undefined;
		let sourcesToReAddAfterStyleChange = undefined;

		function handleError(event) {
			if (onerror) {
				onerror(event);
			} else if (event.error.name !== 'AbortError') {
				// If there's no error handler, just log it to match the default behavior from MapLibre.
				// But skip AbortError since that's a normal thing that happens inside certain sources,
				// and not useful to log.
				console.error(event.error);
			}
		}

		function createMap(element) {
			onHashChange();

			map = mapContext.map = new maplibregl.Map({
				...flush({
					container: element,
					style,
					locale,
					center,
					zoom,
					pitch,
					bearing,
					bearingSnap,
					minZoom,
					maxZoom,
					minPitch,
					maxPitch,
					renderWorldCopies,
					dragPan,
					dragRotate,
					pitchWithRotate,
					antialias,
					interactive,
					preserveDrawingBuffer,
					maxBounds,
					bounds,
					attributionControl,
					transformRequest,
					cooperativeGestures,
					aroundCenter
				}),

				// MapLibre tells "absent" (overscale 4 levels) apart from an explicit `undefined`
				// (overscale everything), and `flush` drops both, so this is applied outside it.
				...zoomLevelsToOverscale === undefined
					? {}
					: { zoomLevelsToOverscale: zoomLevelsToOverscale ?? undefined }
			});

			map.on('load', (e) => {
				e.target.getContainer().setAttribute('data-testid', 'map');
				e.target.getCanvas().setAttribute('data-testid', 'map-canvas');

				if (onload) {
					onload(map);
				}

				mapContext.loaded = true;
				loaded = true;
			});

			map.on('error', handleError);

			if (onmovestart) {
				map.on('movestart', onmovestart);
			}

			map.on('moveend', (ev) => {
				center = ev.target.getCenter();
				zoom = ev.target.getZoom();
				pitch = ev.target.getPitch();
				bearing = ev.target.getBearing();
				bounds = convertBoundsToUserFormat(ev.target.getBounds(), bounds);
				onmoveend?.(ev);

				if (hash) {
					let location = new URL(window.location.href.replace(/(#.+)?$/, getViewportHash(ev.target)));

					updateHash(location);
				}
			});

			if (onclick) {
				map.on('click', onclick);
			}

			if (ondblclick) {
				map.on('dblclick', ondblclick);
			}

			if (oncontextmenu) {
				map.on('contextmenu', oncontextmenu);
			}

			if (onmousemove) {
				map.on('mousemove', onmousemove);
			}

			if (onzoomstart) {
				map.on('zoomstart', onzoomstart);
			}

			if (onzoom) {
				map.on('zoom', onzoom);
			}

			if (onzoomend) {
				map.on('zoomend', onzoomend);
			}

			if (onpitch) {
				map.on('pitch', onpitch);
			}

			if (onrotate) {
				map.on('rotate', onrotate);
			}

			if (onwheel) {
				map.on('wheel', onwheel);
			}

			if (ondata) {
				map.on('data', ondata);
			}

			if (onidle) {
				map.on('idle', onidle);
			}

			// When the basemap style is changed, it nukes all existing layers and sources
			// Here we listen for style.load events, store the layers and sources that
			// have come from the new basemap style and then add back in any layers and
			// styles that where added by the user as sub elements
			map.on('style.load', (ev) => {
				if (map) {
					if (projection) {
						map.setProjection(projection);
					}

					mapContext.loaded = true;
					loaded = true;

					const mapStyle = map.getStyle();

					lastStyleLayerIds = mapStyle.layers.map((l) => l.id);
					lastStyleSourceIds = Object.keys(mapStyle.sources);

					if (sourcesToReAddAfterStyleChange) {
						for (const [id, source] of Object.entries(sourcesToReAddAfterStyleChange)) {
							map.addSource(id, source);
						}
					}

					if (layersToReAddAfterStyleChange) {
						for (const layer of layersToReAddAfterStyleChange) {
							map.addLayer(layer);
						}
					}

					// Need to reload images as well when the style is changed.
					for (const image of images) {
						// Force the image to reload, since when this runs map.loaded() == false
						// but it's actually safe to do so.
						loadImage(image, true);
					}

					onstyleload?.(ev);
				}
			});

			map.on('styledata', (ev) => {
				if (map && filterLayers) {
					const layers = map.getStyle().layers;

					if (layers) {
						for (let layer of layers) {
							if (!filterLayers(layer)) {
								map.setLayoutProperty(layer.id, 'visibility', 'none');
							}
						}
					}
				}

				onstyledata?.(ev);
			});

			return {
				destroy() {
					loaded = false;
					mapContext.loaded = false;
					map?.remove();
				}
			};
		}

		let lastStyle = style;

		// If the last style is different from the current one
		// we grab a list of the currrent layers and sources
		// compare this with the stored list of layer and source ids
		// to pick out the layers / sources which are not part of the current
		// basemaps.
		// We then update the style which will trigger the style.load event on
		// map which will in turn add the user defined sources and layers back
		// on to the map
		// Changing the style unloads the images. We'll reload them after the map finishes loading the new style.
		function onHashChange() {
			if (hash) {
				let parts = parseViewportHash(window.location.hash);

				if (parts.length >= 3) {
					zoom = parts[0];
					center = [parts[2], parts[1]];
				}

				if (parts.length == 5) {
					bearing = parts[3];
					pitch = parts[4];
				}
			}
		}

		$$renderer.push(`<div${$.attr_class($.clsx(classNames), 'svelte-1w7ilhr', { 'expand-map': !classNames })} data-testid="map-container">`);

		if (map) {
			$$renderer.push('<!--[0-->');

			if (standardControls) {
				$$renderer.push('<!--[0-->');
				NavigationControl($$renderer, { position: standardControlsPosition() });
				$$renderer.push(`<!----> `);

				GeolocateControl($$renderer, {
					position: standardControlsPosition(),
					fitBoundsOptions: { ...fitBoundsOptions, maxZoom: 12 }
				});

				$$renderer.push(`<!----> `);
				FullscreenControl($$renderer, { position: standardControlsPosition() });
				$$renderer.push(`<!----> `);
				ScaleControl($$renderer, { position: standardControlsPosition() });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			children?.($$renderer, {
				map,
				loaded,
				loadedImages: mapContext.loadedImages,
				allImagesLoaded: allImagesLoaded()
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		$.bind_props($$props, {
			map,
			mapContainer,
			center,
			zoom,
			pitch,
			bearing,
			bounds,
			loaded
		});
	});
}