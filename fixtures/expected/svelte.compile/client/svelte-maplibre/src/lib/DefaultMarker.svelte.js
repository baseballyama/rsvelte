import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';
import { Box, getMapContext, setLngLatContext, updatedMarkerContext } from './context.svelte.js';
import { flush } from '$lib/flush.js';

export default function DefaultMarker($$anchor, $$props) {
	$.push($$props, true);

	/** The Marker instance which was added to the map */
	/** Handle mouse events */
	/** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
	 * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
	/** An offset in pixels to apply to the marker. */
	/** The rotation angle of the marker (clockwise, in degrees) */
	/** The opacity of the marker */
	let markerProp = $.prop($$props, 'marker', 15, undefined),
		lngLat = $.prop($$props, 'lngLat', 15),
		classNames = $.prop($$props, 'class', 3, undefined),
		draggable = $.prop($$props, 'draggable', 3, false),
		feature = $.prop($$props, 'feature', 3, undefined),
		offset = $.prop($$props, 'offset', 3, undefined),
		rotation = $.prop($$props, 'rotation', 3, 0),
		opacity = $.prop($$props, 'opacity', 3, 1),
		ondrag = $.prop($$props, 'ondrag', 3, undefined),
		ondragstart = $.prop($$props, 'ondragstart', 3, undefined),
		ondragend = $.prop($$props, 'ondragend', 3, undefined);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map);

	const { layerEvent, marker } = updatedMarkerContext();
	const dragStartListener = () => sendEvent(ondragstart(), 'dragstart');

	const dragListener = () => {
		propagateLngLatChange();
		sendEvent(ondrag(), 'drag');
	};

	const dragEndListener = () => {
		propagateLngLatChange();
		sendEvent(ondragend(), 'dragend');
	};

	onDestroy(() => {
		markerProp(undefined);
		marker.value?.remove();
	});

	$.user_pre_effect(() => {
		if ($.get(map) && !marker.value) {
			marker.value = new maplibregl.Marker(flush({
				draggable: draggable(),
				rotation: rotation(),
				className: classNames(),
				anchor: $$props.anchor,
				offset: offset(),
				opacity: opacity().toString()
			})).setLngLat(lngLat()).addTo($.get(map));

			markerProp(marker.value);

			if (draggable()) {
				marker.value.on('dragstart', dragStartListener);
				marker.value.on('drag', dragListener);
				marker.value.on('dragend', dragEndListener);
			}
		}
	});

	let lngLatBox = new Box(lngLat());

	setLngLatContext(lngLatBox);

	$.user_effect(() => {
		marker.value?.setLngLat(lngLat());
		lngLatBox.value = lngLat();
	});

	$.user_effect(() => {
		if (offset()) {
			marker.value?.setOffset(offset());
		}
	});

	$.user_effect(() => {
		marker.value?.setRotation(rotation());
	});

	$.user_effect(() => {
		marker.value?.setOpacity(opacity().toString());
	});

	function propagateLngLatChange() {
		let newPos = marker.value?.getLngLat();

		if (!newPos) {
			return;
		}

		// Update the props using the same format they are already in.
		if (Array.isArray(lngLat())) {
			lngLat([newPos.lng, newPos.lat]);
		} else if (lngLat() && 'lon' in lngLat()) {
			lngLat({ lon: newPos.lng, lat: newPos.lat });
		} else {
			lngLat(newPos);
		}
	}

	function sendEvent(eventCb, eventName) {
		let loc = marker.value?.getLngLat();

		if (!loc) {
			return;
		}

		const lngLat = [loc.lng, loc.lat];

		let data = {
			map: $.get(map),
			marker: marker.value,
			lngLat,
			features: [
				{
					type: 'Feature',
					properties: feature()?.properties ?? {},
					geometry: { type: 'Point', coordinates: lngLat }
				}
			]
		};

		layerEvent.value = { ...data, layerType: 'marker', type: eventName };
		eventCb?.(data);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ marker: marker.value }));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (marker.value) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}