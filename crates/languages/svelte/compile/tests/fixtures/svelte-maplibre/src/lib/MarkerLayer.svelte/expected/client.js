import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { getId, getSource, getZoomLimits, getMapContext } from './context.svelte.js';
import { combineFilters, isClusterFilter } from './filters';
import { geoCentroid } from 'd3-geo';
import Marker from './Marker.svelte';
import FillLayer from './FillLayer.svelte';
import { dequal } from 'dequal/lite';

var root = $.from_html(`<!> <!>`, 1);

export default function MarkerLayer($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

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
	let applyToClusters = $.prop($$props, 'applyToClusters', 3, undefined),
		filter = $.prop($$props, 'filter', 3, undefined),
		anchor = $.prop($$props, 'anchor', 3, undefined),
		offset = $.prop($$props, 'offset', 3, undefined),
		markerLngLat = $.prop($$props, 'markerLngLat', 3, geoCentroid),
		interactive = $.prop($$props, 'interactive', 3, true),
		asButton = $.prop($$props, 'asButton', 3, false),
		draggable = $.prop($$props, 'draggable', 3, false),
		minzoom = $.prop($$props, 'minzoom', 3, undefined),
		maxzoom = $.prop($$props, 'maxzoom', 3, undefined),
		hovered = $.prop($$props, 'hovered', 15, undefined),
		zIndex = $.prop($$props, 'zIndex', 3, undefined),
		className = $.prop($$props, 'class', 3, undefined),
		onclick = $.prop($$props, 'onclick', 3, undefined),
		ondblclick = $.prop($$props, 'ondblclick', 3, undefined),
		oncontextmenu = $.prop($$props, 'oncontextmenu', 3, undefined),
		ondrag = $.prop($$props, 'ondrag', 3, undefined),
		ondragstart = $.prop($$props, 'ondragstart', 3, undefined),
		ondragend = $.prop($$props, 'ondragend', 3, undefined);

	let actualMinZoom = $.derived(() => minzoom() ?? zoomLimits.minzoom);
	let actualMaxZoom = $.derived(() => maxzoom() ?? zoomLimits.maxzoom);
	let actualFilter = $.derived(() => combineFilters('all', isClusterFilter(applyToClusters()), filter()));
	let installedHandlers = false;

	function setupHandlers() {
		if (!$.get(map) || installedHandlers) return;

		installedHandlers = true;
		$.set(zoom, $.get(map).getZoom(), true);
		$.get(map).on('zoom', handleZoom);
		$.get(map).on('move', updateMarkers);
		$.get(map).on('moveend', updateMarkers);

		if ($.get(map).loaded()) {
			updateMarkers();
		} else {
			// updateMarkers queries the map, so if it's not in a steady state then we need to wait
			$.get(map).once('load', updateMarkers);
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
		if (!$.get(map)) {
			return;
		}

		$.get(map).off('zoom', handleZoom);
		$.get(map).off('move', updateMarkers);
		$.get(map).off('moveend', updateMarkers);
	});

	let sourceObj = $.derived(() => $.get(map) && source?.value ? $.get(map).getSource(source.value) : undefined);

	$.user_effect(() => {
		if (!$.get(map)) {
			return;
		}

		$.get(map).on('sourcedata', handleData);

		if ($.get(sourceObj)?.loaded()) {
			setupHandlers();
		}

		return () => {
			$.get(map).off('sourcedata', handleData);
		};
	});

	let features = $.state($.proxy([]));

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
		if (!source?.value || !$.get(map)) {
			return;
		}

		let featureList = $.get(map).querySourceFeatures(source.value, { filter: $.get(actualFilter) });

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

		const currentFeatures = $.get(features);

		// Don't cause markers to rerender if nothing has changed.
		if (!someFeaturesChanged(currentFeatures, sorted)) {
			return;
		}

		$.set(features, sorted, true);
	}

	// svelte-ignore state_referenced_locally
	let zoom = $.state($.proxy($.get(map)?.getZoom() ?? 1));

	function handleZoom() {
		const currentZoom = $.get(map)?.getZoom() ?? 1;

		if (currentZoom) {
			$.set(zoom, currentZoom, true);
		}

		updateMarkers();
	}

	var fragment = root();
	var node = $.first_child(fragment);

	FillLayer(node, {
		get minzoom() {
			return minzoom();
		},

		get maxzoom() {
			return maxzoom();
		},
		paint: { 'fill-opacity': 0 },
		beforeLayerType: 'symbol'
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => $.get(features), (feature) => feature.id, ($$anchor, feature) => {
				const c = $.derived(() => markerLngLat()($.get(feature)));
				const z = $.derived(() => typeof zIndex() === 'function' ? zIndex()($.get(feature)) : zIndex());

				Marker($$anchor, {
					get anchor() {
						return anchor();
					},

					get offset() {
						return offset();
					},

					get asButton() {
						return asButton();
					},

					get interactive() {
						return interactive();
					},

					get draggable() {
						return draggable();
					},

					get class() {
						return className();
					},

					get zIndex() {
						return $.get(z);
					},

					get lngLat() {
						return $.get(c);
					},

					onmouseenter: () => {
						hovered($.get(feature));
					},

					onmouseleave: () => {
						if (hovered()?.id === $.get(feature).id) {
							hovered(undefined);
						}
					},
					ondragstart: (e) => ondragstart()?.({ ...e, source: source?.value, feature: $.get(feature) }),
					ondrag: (e) => ondrag()?.({ ...e, source: source?.value, feature: $.get(feature) }),
					ondragend: (e) => ondragend()?.({ ...e, source: source?.value, feature: $.get(feature) }),
					onclick: (e) => onclick()?.({ ...e, source: source?.value, feature: $.get(feature) }),
					ondblclick: (e) => ondblclick()?.({ ...e, source: source?.value, feature: $.get(feature) }),
					oncontextmenu: (e) => oncontextmenu()?.({ ...e, source: source?.value, feature: $.get(feature) }),
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.children ?? $.noop, () => ({ feature: $.get(feature), position: $.get(c) }));
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(loaded) && $.get(zoom) >= $.get(actualMinZoom) && $.get(zoom) <= $.get(actualMaxZoom)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}