import * as $ from 'svelte/internal/server';
import * as maplibregl from 'maplibre-gl';
import { Box, getMapContext, setLngLatContext, updatedMarkerContext } from './context.svelte.js';

export default function Marker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** The Marker instance which was added to the map */
		/** Handle mouse events */
		/** Make markers tabbable and add the button role. */
		/** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
		 * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
		/** An offset in pixels to apply to the marker. */
		/** The z-index of the marker. This can also be set via CSS classes using the `class` prop */
		/** The rotation angle of the marker (clockwise, in degrees) */
		/** The opacity of the marker */
		let {
			marker: markerProp = undefined,
			lngLat = void 0,
			class: classNames = undefined,
			interactive = true,
			asButton = false,
			draggable = false,
			feature = undefined,
			offset = undefined,
			zIndex = undefined,
			rotation = 0,
			opacity = 1,
			anchor,
			children,
			$$slots,
			$$events,
			...eventCbs
		} = $$props;

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			markerClickManager = $.derived(() => $$d().markerClickManager);

		const { layerEvent, marker } = updatedMarkerContext();

		const addMarker = (node) => {
			const dragStartListener = () => sendEvent('dragstart');

			const dragListener = () => {
				propagateLngLatChange();
				sendEvent('drag');
			};

			const dragEndListener = () => {
				propagateLngLatChange();
				sendEvent('dragend');
			};

			return {
				destroy: () => {
					if (draggable) {
						marker.value?.off('dragstart', dragStartListener);
						marker.value?.off('drag', dragListener);
						marker.value?.off('dragend', dragEndListener);
					}

					markerProp = undefined;
					marker.value?.remove();
				}
			};
		};

		let previousClassNames;

		function manageClasses(node) {
			// Parse the classNames prop into a set
			// Calculate classes to remove and add
			// Batch DOM changes
			// Update previousClassNames for next comparison
		}

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

		function handleKeyDown(e) {
			if (e.key === ' ') {
				e.preventDefault();
				e.stopPropagation();
				sendEvent('click');
			}
		}

		function sendEvent(eventName) {
			if (!interactive) {
				return;
			}

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

			if (eventName === 'click' || eventName === 'contextmenu') {
				markerClickManager().handleClick(data);
			}

			layerEvent.value = { ...data, layerType: 'marker', type: eventName };

			const cb = eventCbs['on' + eventName];

			cb?.(data);
		}

		$$renderer.push(`<div${$.attr('tabindex', asButton ? 0 : undefined)}${$.attr('role', asButton ? 'button' : undefined)}${$.attr_style('', { 'z-index': zIndex })}>`);
		children?.($$renderer, { marker: marker.value });
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { marker: markerProp, lngLat });
	});
}