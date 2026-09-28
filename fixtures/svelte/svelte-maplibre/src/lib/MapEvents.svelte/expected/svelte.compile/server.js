import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';

export default function MapEvents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** Limit the event handlers to a certain layer. */
		let { layer = undefined, $$slots, $$events, ...eventCbs } = $$props;

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map);

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

		onDestroy(() => {
			if (map()) {
				if (layer) {
					for (const eventName of layerEvents) {
						if (getHandler(eventName)) {
							map().off(eventName, layer, sendEvent);
						}
					}
				} else {
					for (const eventName of mapEvents) {
						if (getHandler(eventName)) {
							map().off(eventName, sendEvent);
						}
					}
				}
			}
		});
	});
}