import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as maplibregl from 'maplibre-gl';
import { Box, getMapContext, setLngLatContext, updatedMarkerContext } from './context.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'marker',
	'lngLat',
	'class',
	'interactive',
	'asButton',
	'draggable',
	'feature',
	'offset',
	'zIndex',
	'rotation',
	'opacity',
	'anchor',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Marker($$anchor, $$props) {
	$.push($$props, true);

	/** The Marker instance which was added to the map */
	/** Handle mouse events */
	/** Make markers tabbable and add the button role. */
	/** A GeoJSON Feature related to the point. This is only actually used to send an ID and set of properties along with
	 * the event, and can be safely omitted. The `lngLat` prop controls the marker's location even if this is provided. */
	/** An offset in pixels to apply to the marker. */
	/** The z-index of the marker. This can also be set via CSS classes using the `class` prop */
	/** The rotation angle of the marker (clockwise, in degrees) */
	/** The opacity of the marker */
	let markerProp = $.prop($$props, 'marker', 15, undefined),
		lngLat = $.prop($$props, 'lngLat', 15),
		classNames = $.prop($$props, 'class', 3, undefined),
		interactive = $.prop($$props, 'interactive', 3, true),
		asButton = $.prop($$props, 'asButton', 3, false),
		draggable = $.prop($$props, 'draggable', 3, false),
		feature = $.prop($$props, 'feature', 3, undefined),
		offset = $.prop($$props, 'offset', 3, undefined),
		zIndex = $.prop($$props, 'zIndex', 3, undefined),
		rotation = $.prop($$props, 'rotation', 3, 0),
		opacity = $.prop($$props, 'opacity', 3, 1),
		eventCbs = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		markerClickManager = $.derived(() => $.get($$d).markerClickManager);

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

		$.user_pre_effect(() => {
			if (!$.get(map) || marker.value) return;

			marker.value = new maplibregl.Marker({
				element: node,
				rotation: rotation(),
				draggable: draggable(),
				offset: offset(),
				anchor: $$props.anchor,
				opacity: opacity().toString()
			}).setLngLat(lngLat()).addTo($.get(map));

			markerProp(marker.value);

			if (draggable()) {
				marker.value.on('dragstart', dragStartListener);
				marker.value.on('drag', dragListener);
				marker.value.on('dragend', dragEndListener);
			}
		});

		return {
			destroy: () => {
				if (draggable()) {
					marker.value?.off('dragstart', dragStartListener);
					marker.value?.off('drag', dragListener);
					marker.value?.off('dragend', dragEndListener);
				}

				markerProp(undefined);
				marker.value?.remove();
			}
		};
	};

	let previousClassNames;

	function manageClasses(node) {
		$.user_pre_effect(() => {
			if (!marker.value) return;

			// Parse the classNames prop into a set
			const newClassNames = new Set(classNames()?.split(/\s+/).filter((c) => c.length > 0) ?? []);

			// Calculate classes to remove and add
			const previous = previousClassNames;

			const toRemove = previous
				? [...previous].filter((c) => !newClassNames.has(c))
				: [];

			const toAdd = previous
				? [...newClassNames].filter((c) => !previous.has(c))
				: [...newClassNames];

			// Batch DOM changes
			if (toRemove.length > 0 || toAdd.length > 0) {
				if (toRemove.length > 0) {
					node.classList.remove(...toRemove);
				}

				if (toAdd.length > 0) {
					node.classList.add(...toAdd);
				}
			}

			// Update previousClassNames for next comparison
			previousClassNames = newClassNames;
		});
	}

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

	function handleKeyDown(e) {
		if (e.key === ' ') {
			e.preventDefault();
			e.stopPropagation();
			sendEvent('click');
		}
	}

	function sendEvent(eventName) {
		if (!interactive()) {
			return;
		}

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

		if (eventName === 'click' || eventName === 'contextmenu') {
			$.get(markerClickManager).handleClick(data);
		}

		layerEvent.value = { ...data, layerType: 'marker', type: eventName };

		const cb = eventCbs['on' + eventName];

		cb?.(data);
	}

	var div = root();
	let styles;
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ marker: marker.value }));
	$.reset(div);
	$.action(div, ($$node) => addMarker?.($$node));
	$.action(div, ($$node) => manageClasses?.($$node));

	$.template_effect(() => {
		$.set_attribute(div, 'tabindex', asButton() ? 0 : undefined);
		$.set_attribute(div, 'role', asButton() ? 'button' : undefined);
		styles = $.set_style(div, '', styles, { 'z-index': zIndex() });
	});

	$.delegated('click', div, (e) => {
		e.stopPropagation();
		sendEvent('click');
	});

	$.delegated('dblclick', div, (e) => {
		e.stopPropagation();
		sendEvent('dblclick');
	});

	$.delegated('contextmenu', div, (e) => {
		e.stopPropagation();
		e.preventDefault();
		sendEvent('contextmenu');
	});

	$.event('mouseenter', div, () => {
		sendEvent('mouseenter');
	});

	$.event('mouseleave', div, () => {
		sendEvent('mouseleave');
	});

	$.delegated('mousemove', div, () => sendEvent('mousemove'));
	$.delegated('keydown', div, handleKeyDown);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'dblclick', 'contextmenu', 'mousemove', 'keydown']);