import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';
import { Box, getMapContext, setLngLatContext, updatedMarkerContext } from './context.svelte.js';
import { flush } from '$lib/flush.js';

export default function DefaultMarker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** The Marker instance which was added to the map */
		/** Handle mouse events */
		/** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
		 * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
		/** An offset in pixels to apply to the marker. */
		/** The rotation angle of the marker (clockwise, in degrees) */
		/** The opacity of the marker */
		let {
			marker: markerProp = undefined,
			lngLat = void 0,
			class: classNames = undefined,
			anchor,
			draggable = false,
			feature = undefined,
			offset = undefined,
			rotation = 0,
			opacity = 1,
			children,
			ondrag = undefined,
			ondragstart = undefined,
			ondragend = undefined
		} = $$props;

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map);

		const { layerEvent, marker } = updatedMarkerContext();
		const dragStartListener = () => sendEvent(ondragstart, 'dragstart');

		const dragListener = () => {
			propagateLngLatChange();
			sendEvent(ondrag, 'drag');
		};

		const dragEndListener = () => {
			propagateLngLatChange();
			sendEvent(ondragend, 'dragend');
		};

		onDestroy(() => {
			markerProp = undefined;
			marker.value?.remove();
		});

		let lngLatBox = new Box(lngLat);

		setLngLatContext(lngLatBox);

		function propagateLngLatChange() {
			let newPos = marker.value?.getLngLat();

			if (!newPos) {
				return;
			}

			// Update the props using the same format they are already in.
			if (Array.isArray(lngLat)) {
				lngLat = [newPos.lng, newPos.lat];
			} else if (lngLat && 'lon' in lngLat) {
				lngLat = { lon: newPos.lng, lat: newPos.lat };
			} else {
				lngLat = newPos;
			}
		}

		function sendEvent(eventCb, eventName) {
			let loc = marker.value?.getLngLat();

			if (!loc) {
				return;
			}

			const lngLat = [loc.lng, loc.lat];

			let data = {
				map: map(),
				marker: marker.value,
				lngLat,
				features: [
					{
						type: 'Feature',
						properties: feature?.properties ?? {},
						geometry: { type: 'Point', coordinates: lngLat }
					}
				]
			};

			layerEvent.value = { ...data, layerType: 'marker', type: eventName };
			eventCb?.(data);
		}

		if (marker.value) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer, { marker: marker.value });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { marker: markerProp, lngLat });
	});
}