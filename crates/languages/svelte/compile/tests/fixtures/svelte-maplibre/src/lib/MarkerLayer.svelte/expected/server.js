import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getId, getSource, getZoomLimits, getMapContext } from './context.svelte.js';
import { combineFilters, isClusterFilter } from './filters';
import { geoCentroid } from 'd3-geo';
import Marker from './Marker.svelte';
import FillLayer from './FillLayer.svelte';
import { dequal } from 'dequal/lite';

export default function MarkerLayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		const source = getSource();
		const zoomLimits = getZoomLimits();

		/** CSS classes to apply to each marker */
		/** Pixel offset passed through to `Marker` / MapLibre. */
		/** How to calculate the coordinates of the marker.
		 * @default Calls d3.geoCentroid` on the feature. */
		/** Handle mouse events */
		/** Make markers tabbable and add the button role. */
		/** The z-index of the markers. This can also be set via CSS classes using the `class` prop.
		 * If a function is provided, it will be called with each feature as an argument. */
		let {
			applyToClusters = undefined,
			filter = undefined,
			anchor = undefined,
			offset = undefined,
			markerLngLat = geoCentroid,
			interactive = true,
			asButton = false,
			draggable = false,
			minzoom = undefined,
			maxzoom = undefined,
			hovered = undefined,
			zIndex = undefined,
			class: className = undefined,
			children,
			onclick = undefined,
			ondblclick = undefined,
			oncontextmenu = undefined,
			ondrag = undefined,
			ondragstart = undefined,
			ondragend = undefined
		} = $$props;

		let actualMinZoom = $.derived(() => minzoom ?? zoomLimits.minzoom);
		let actualMaxZoom = $.derived(() => maxzoom ?? zoomLimits.maxzoom);
		let actualFilter = $.derived(() => combineFilters('all', isClusterFilter(applyToClusters), filter));
		let installedHandlers = false;

		function setupHandlers() {
			if (!map() || installedHandlers) return;

			installedHandlers = true;
			zoom = map().getZoom();
			map().on('zoom', handleZoom);
			map().on('move', updateMarkers);
			map().on('moveend', updateMarkers);

			if (map().loaded()) {
				updateMarkers();
			} else {
				// updateMarkers queries the map, so if it's not in a steady state then we need to wait
				map().once('load', updateMarkers);
			}
		}

		function handleData(e) {
			if (e.sourceId === source?.value && e.isSourceLoaded) {
				if (installedHandlers) {
					updateMarkers();
				} else {
					setupHandlers();
				}
			}
		}

		onDestroy(() => {
			if (!map()) {
				return;
			}

			map().off('zoom', handleZoom);
			map().off('move', updateMarkers);
			map().off('moveend', updateMarkers);
		});

		let sourceObj = $.derived(() => map() && source?.value ? map().getSource(source.value) : undefined);
		let features = [];

		function stripAutoFeatId(f) {
			if (f.id.toString().startsWith('autocluster_')) {
				return 'autocluster';
			}

			if (f.id.toString().startsWith('autofeat')) {
				return 'autofeat';
			}

			return f.id;
		}

		function someFeaturesChanged(current, next) {
			return current.length !== next.length || next.some((nextValue, idx) => {
				const currentValue = current[idx];

				return !dequal(
					{
						...currentValue?.toJSON(),
						id: currentValue ? stripAutoFeatId(currentValue) : undefined
					},
					{ ...nextValue.toJSON(), id: stripAutoFeatId(nextValue) }
				);
			});
		}

		function updateMarkers() {
			if (!source?.value || !map()) {
				return;
			}

			let featureList = map().querySourceFeatures(source.value, { filter: actualFilter() });

			// Need to dedupe the results of featureList
			let featureMap = new Map();

			for (let feature of featureList) {
				if (!feature.id) {
					if (feature.properties?.cluster_id) {
						feature.id = 'autocluster_' + feature.properties.cluster_id;
					} else {
						feature.id = getId('autofeat');
					}
				}

				featureMap.set(feature.id, feature);
			}

			// Sort the features by ID so that the #each loop doesn't think the order ever changes. If the order
			// changes then it tries to move the element around which interferes with the map's management of the
			// marker element.
			const sorted = [...featureMap.values()].sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

			const currentFeatures = features;

			// Don't cause markers to rerender if nothing has changed.
			if (!someFeaturesChanged(currentFeatures, sorted)) {
				return;
			}

			features = sorted;
		}

		// svelte-ignore state_referenced_locally
		let zoom = map()?.getZoom() ?? 1;

		function handleZoom() {
			const currentZoom = map()?.getZoom() ?? 1;

			if (currentZoom) {
				zoom = currentZoom;
			}

			updateMarkers();
		}

		FillLayer($$renderer, {
			minzoom,
			maxzoom,
			paint: { 'fill-opacity': 0 },
			beforeLayerType: 'symbol'
		});

		$$renderer.push(`<!----> `);

		if (loaded() && zoom >= actualMinZoom() && zoom <= actualMaxZoom()) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(features);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let feature = each_array[$$index];
				const c = markerLngLat(feature);
				const z = typeof zIndex === 'function' ? zIndex(feature) : zIndex;

				Marker($$renderer, {
					anchor,
					offset,
					asButton,
					interactive,
					draggable,
					class: className,
					zIndex: z,
					lngLat: c,
					onmouseenter: () => {
						hovered = feature;
					},

					onmouseleave: () => {
						if (hovered?.id === feature.id) {
							hovered = undefined;
						}
					},
					ondragstart: (e) => ondragstart?.({ ...e, source: source?.value, feature }),
					ondrag: (e) => ondrag?.({ ...e, source: source?.value, feature }),
					ondragend: (e) => ondragend?.({ ...e, source: source?.value, feature }),
					onclick: (e) => onclick?.({ ...e, source: source?.value, feature }),
					ondblclick: (e) => ondblclick?.({ ...e, source: source?.value, feature }),
					oncontextmenu: (e) => oncontextmenu?.({ ...e, source: source?.value, feature }),
					children: ($$renderer) => {
						children?.($$renderer, { feature, position: c });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { hovered });
	});
}