import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'layer']);

export default function MapEvents($$anchor, $$props) {
	$.push($$props, true);

	/** Limit the event handlers to a certain layer. */
	let layer = $.prop($$props, 'layer', 3, undefined),
		eventCbs = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map);

	function getHandler(event) {
		// @ts-expect-error Typing
		return eventCbs['on' + event];
	}

	function sendEvent(e) {
		getHandler(e.type)?.(e);
	}

	const layerEvents = [
		'click',
		'dblclick',
		'mousedown',
		'mouseup',
		'mousemove',
		'mouseenter',
		'mouseleave',
		'contextmenu',
		'mouseover',
		'mouseout'
	];

	const mapEvents = [
		'click',
		'dblclick',
		'contextmenu',
		'mousemove',
		'movestart',
		'moveend',
		'zoomstart',
		'zoom',
		'zoomend',
		'pitch',
		'rotate',
		'wheel',
		'data',
		'styledata',
		'idle'
	];

	$.user_effect(() => {
		if ($.get(map)) {
			if (layer()) {
				for (const eventName of layerEvents) {
					if (getHandler(eventName)) {
						$.get(map).on(eventName, layer(), sendEvent);
					}
				}
			} else {
				for (const eventName of mapEvents) {
					if (getHandler(eventName)) {
						$.get(map).on(eventName, sendEvent);
					}
				}
			}
		}
	});

	onDestroy(() => {
		if ($.get(map)) {
			if (layer()) {
				for (const eventName of layerEvents) {
					if (getHandler(eventName)) {
						$.get(map).off(eventName, layer(), sendEvent);
					}
				}
			} else {
				for (const eventName of mapEvents) {
					if (getHandler(eventName)) {
						$.get(map).off(eventName, sendEvent);
					}
				}
			}
		}
	});

	$.pop();
}